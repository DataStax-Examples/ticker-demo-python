import logging
import time
from decimal import Decimal

try: import simplejson as json
except ImportError: import json

from flask import Flask, Blueprint, render_template, request, session, jsonify

# from routes.rest import get_session, \
#     get_solr_session
app = Flask(__name__)
ticker_endpoint = Blueprint('ticker_endpoint', __name__)

cassandra_session = None
solr_session = None
prepared_statements = None


def preflight_check():
    global prepared_statements
    if not cassandra_helper.session:
        # cassandra_helper.session = cassandra_helper.sess()
        # solr_session = cassandra_helper.solr_session

        prepared_statements = {}
        prepared_statements['get_user'] = cassandra_helper.session.prepare('''
            SELECT * FROM ticker.user
            WHERE email_address = ?
        ''')
        prepared_statements['update_user'] = cassandra_helper.session.prepare('''
            INSERT INTO ticker.user
                (email_address, risk_tolerance,
                preferred_investment_types, retirement_age, withdrawal_year)
            VALUES
                (?, ?, ?, ?, ?)
        ''')

        prepared_statements['get_history'] = cassandra_helper.session.prepare('''
            SELECT * FROM ticker.history
            WHERE email_address = ?
        ''')
        prepared_statements['update_history'] = cassandra_helper.session.prepare('''
            INSERT INTO ticker.history
                (email_address, date, buy, exchange, symbol, name, price,
                quantity)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
        ''')

        prepared_statements['get_portfolio'] = cassandra_helper.session.prepare('''
            SELECT * FROM ticker.portfolio
            WHERE email_address = ?
        ''')
        prepared_statements['update_portfolio'] = cassandra_helper.session.prepare('''
            INSERT INTO ticker.portfolio
                (email_address, exchange, symbol, date, name, buy, price,
                quantity)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
        ''')

        prepared_statements['get_recommendations'] = \
            cassandra_helper.session.prepare('''
            SELECT * FROM ticker.recommendations
            WHERE risk_tolerance = ? AND preferred_investment_types = ?
                AND retirement_age = ? AND withdrawal_year = ?
        ''')

        prepared_statements['search_symbol'] = cassandra_helper.solr_session.prepare('''
            SELECT * FROM ticker.latest
            WHERE solr_query = ?
        ''')

        prepared_statements['get_quote'] = cassandra_helper.session.prepare('''
            SELECT * FROM ticker.quotes
            WHERE exchange = ? AND symbol = ?
            LIMIT 1
        ''')


@ticker_endpoint.route('/')
def index():
    return render_template('/index.jinja2')


@ticker_endpoint.route('/login', methods=['POST'])
def login():
    preflight_check()
    
    session['email_address'] = request.form.get('email_address')

    values = {
        'email_address': session['email_address'],
        'risk_tolerance': '',
        'preferred_investment_types': [],
        'retirement_age': '',
        'withdrawal_year': '',
    }


    cassandra_helper.session.execute(prepared_statements['update_user'].bind(values))
    '''
    GENERATE SEED DATA FOR THIS ACCOUNT!
    '''

    return render_template('/orbeus.jinja2')


@ticker_endpoint.route('/disclaimer')
def disclaimer():
    return render_template('/disclaimer.jinja2')


@ticker_endpoint.route('/dash')
def dash():
    return render_template('/dash.jinja2')


@ticker_endpoint.route('/search')
def search():
    preflight_check()
    search_term = request.args.get('search_term', 'MSFT')
    solr_query = {
        'q': 'symbol:*{0}* name:*{0}*'.format(search_term),
        'sort': 'volume desc'
    }
    values = {
        'solr_query': json.dumps(solr_query)
    }
    alert = None
    try:
        search_results = cassandra_helper.solr_session.execute(
            prepared_statements['search_symbol'].bind(values))

        if len(search_results) == 0:
            alert = {
                'level': 'info',
                'message': 'No results found.'
            }
    except:
        logging.exception('Search failed:')
        search_results = []
        if ' ' in search_term:
            alert = {
                'level': 'warning',
                'message': 'Multi-word search coming soon to demo.',
            }
        else:
            alert = {
                'level': 'danger',
                'message': 'Unexpected error.',
            }

    results = []
    for row in search_results:
        results.append(dict(row))

    return render_template('/search.jinja2',
                           results=results,
                           search_term=search_term,
                           alert=alert)


@ticker_endpoint.route('/customize')
def customize():
    preflight_check()
    values = {
        'email_address': session['email_address']
    }
    user_profile = cassandra_helper.session.execute(
        prepared_statements['get_user'].bind((values)))
    if user_profile:
        user_profile = dict(user_profile[0])
    if user_profile['preferred_investment_types'] is None:
        user_profile['preferred_investment_types'] = []
    return render_template('/customize.jinja2',
                           user_profile=user_profile)


def _get_portfolio(email_address):
    values = {
        'email_address': email_address
    }
    user_history = cassandra_helper.session.execute(
        prepared_statements['get_portfolio'].bind(values))

    results = []
    current_record = None
    for row in user_history:
        if current_record and current_record['symbol'] != row['symbol']:
            results.append(current_record)
            current_record = None
        if not current_record:
            current_record = {
                'exchange': row['exchange'],
                'symbol': row['symbol'],
                'name': row['name'],
                'quantity': 0,
                'investment': 0,
                'last_trade': row['price']
            }
        if row['buy']:
            current_record['quantity'] += row['quantity']
            current_record['investment'] -= row['quantity'] * row['price']
        else:
            current_record['quantity'] -= row['quantity']
            current_record['investment'] += row['quantity'] * row['price']
    if current_record:
        results.append(current_record)

    return results


@ticker_endpoint.route('/portfolio', methods=['GET', 'POST'])
def portfolio():
    preflight_check()
    results = _get_portfolio(session['email_address'])

    return render_template('/portfolio.jinja2',
                           crumb='portfolio',
                           results=results)


@ticker_endpoint.route('/transactions')
def transactions():
    preflight_check()
    values = {
        'email_address': session['email_address']
    }
    user_history = cassandra_helper.session.execute(
        prepared_statements['get_history'].bind(values))

    results = []
    for row in user_history:
        results.append(dict(row))
    return render_template('/transactions.jinja2',
                           crumb='transactions',
                           results=results)


def _portfolio_hash(email_address):
    portfolio = _get_portfolio(email_address)

    portfolio_hash = {}
    for row in portfolio:
        if not row['exchange'] in portfolio_hash:
            portfolio_hash[row['exchange']] = {}
        if not row['symbol'] in portfolio_hash[row['exchange']]:
            portfolio_hash[row['exchange']][row['symbol']] = row

    return portfolio_hash


@ticker_endpoint.route('/recommendations', methods=['GET', 'POST'])
def recommendations():
    preflight_check()
    if request.method == 'POST':
        values = {
            'email_address': session['email_address'],
            'risk_tolerance': request.form.get('risk_tolerance'),
            'preferred_investment_types': [],
            'retirement_age': request.form.get('retirement_age'),
            'withdrawal_year': request.form.get('withdrawal_year'),
        }

        for key in request.form:
            if 'preferred_investment_types' in key:
                values['preferred_investment_types'].append(key.split(':')[1])

        cassandra_helper.session.execute(
            prepared_statements['update_user'].bind(values))
    else:
        values = {
            'email_address': session['email_address']
        }
        user = cassandra_helper.session.execute(
            prepared_statements['get_user'].bind(values))

        values = {}
        if user:
            row = user[0]
            values = {
                'email_address': row['email_address'],
                'risk_tolerance': row['risk_tolerance'],
                'preferred_investment_types': row['preferred_investment_types'],
                'retirement_age': row['retirement_age'],
                'withdrawal_year': row['withdrawal_year'],
            }

    results = []
    if values:
        # this is how we'll be indexing preferred_investment_types in the
        # recommendations table
        if values['preferred_investment_types'] is not None:
            values['preferred_investment_types'].sort()
            values['preferred_investment_types'] = '_'.join(values['preferred_investment_types'])
        else:
            values['preferred_investment_types'] = '_'
        del values['email_address']

        recommendation_results = cassandra_helper.session.execute(
            prepared_statements['get_recommendations'].bind(values))

        update_date = None
        for row in recommendation_results:
            # only read the latest recommendation update
            if not update_date:
                update_date = row['updated_date']
            if row['updated_date'] != update_date:
                break

            results.append(dict(row))

    return render_template('/recommendations.jinja2',
                           crumb='recommendations',
                           results=results)


def buy_string_to_bool(string):
    return string.lower() in ('yes', 'true', 't', '1', 'buy')


@ticker_endpoint.route('/buy', methods=['POST'])
def buy():
    preflight_check()
    values = {
        'email_address': session['email_address'],
        'date': request.form.get('date') if request.form.get('date') \
            else time.time() * 1000,
        'buy': buy_string_to_bool(request.form.get('buy')),
        'exchange': request.form.get('exchange'),
        'symbol': request.form.get('symbol'),
        'name': request.form.get('name'),
        'price': Decimal(request.form.get('price')),
        'quantity': Decimal(request.form.get('quantity')),
    }
    cassandra_helper.session.execute(
        prepared_statements['update_history'].bind(values))
    cassandra_helper.session.execute(
        prepared_statements['update_portfolio'].bind(values))
    return jsonify({'status': 'ok'})


@ticker_endpoint.route('/quote')
def quote():
    if not request.args.get('exchange') or not request.args.get('symbol'):
        return jsonify({'error': 'exchange and symbol required.'})
    values = {
        'exchange': request.args.get('exchange'),
        'symbol': request.args.get('symbol'),
    }
    quote = cassandra_helper.session.execute(
        prepared_statements['get_quote'].bind(values))

    results = {}
    if quote:
        results = dict(quote[0])

    return jsonify(results)
