#!/usr/bin/env python

import csv
import itertools
import time
import random
import uuid

from cassandra.cluster import Cluster
from cassandra.query import ordered_dict_factory

ip_addresses = '127.0.0.1'
ip_addresses = ip_addresses.split(',')
cluster = Cluster(ip_addresses)
session = cluster.connect()
session.row_factory = ordered_dict_factory

seed_file = open('stock_seed_data.csv', 'r')
QUOTE_DATA = []
reader = csv.DictReader(seed_file)
for row in reader:
    row['date'] = time.mktime(time.strptime(row['date'], '%d-%b-%Y')) * 1000
    row['volume'] = int(row['volume'])
    row['open'] = float(row['open'])
    row['close'] = float(row['close'])
    row['low'] = float(row['low'])
    row['high'] = float(row['high'])
    row['current'] = row['close']

    QUOTE_DATA.append(row)


def insert_quotes():
    print 'Seeding quotes and latest...'
    insert_quote = session.prepare('''
        INSERT INTO ticker.quotes
            (exchange, symbol, name, sector, marketcap, date, volume, open,
            close, low, high, current)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''')
    insert_latest = session.prepare('''
        INSERT INTO ticker.latest
            (exchange, symbol, name, sector, marketcap, date, volume, open,
            close, low, high, current)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''')

    for row in QUOTE_DATA:
        session.execute(insert_quote.bind(row))
        session.execute(insert_latest.bind(row))


def _generate_recommendation(risk_tolerance, preferred_investment_types,
                             retirement_age, withdrawal_year, updated_date):
    row = QUOTE_DATA[random.randint(0, len(QUOTE_DATA) - 1)]
    buy = random.choice([True, False])

    return {
        'risk_tolerance': risk_tolerance,
        'preferred_investment_types': preferred_investment_types,
        'retirement_age': retirement_age,
        'withdrawal_year': withdrawal_year,
        'updated_date': updated_date,
        'recommendation_id': uuid.uuid4(),
        'exchange': row['exchange'],
        'symbol': row['symbol'],
        'name': row['name'],
        'buy': buy,
        'quantity': random.randint(1, 10000),
        'projected_growth': random.random(),
        'invested_peers': random.random()
    }


def insert_recommendations():
    print 'Seeding recommendations...'
    insert_recommendation = session.prepare('''
        INSERT INTO ticker.recommendations
            (risk_tolerance, preferred_investment_types, retirement_age,
            withdrawal_year, updated_date, recommendation_id, exchange, symbol,
            name, buy, quantity, projected_growth, invested_peers)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''')

    values = [
        {
            'risk_tolerance': 'high',
            'preferred_investment_types':
                'bonds_international-securities_money-market',
            'retirement_age': '35-45',
            'withdrawal_year': '30+',
            'updated_date': time.time() * 1000,
            'recommendation_id': uuid.uuid4(),
            'exchange': 'NYSE',
            'symbol': 'NKE',
            'name': 'Nike',
            'buy': True,
            'quantity': 100,
            'projected_growth': .65,
            'invested_peers': .8
        },
        {
            'risk_tolerance': 'high',
            'preferred_investment_types':
                'bonds_international-securities_money-market',
            'retirement_age': '35-45',
            'withdrawal_year': '30+',
            'updated_date': time.time() * 1000,
            'recommendation_id': uuid.uuid4(),
            'exchange': 'NYSE',
            'symbol': 'VZA',
            'name': 'Verizon',
            'buy': True,
            'quantity': 1000,
            'projected_growth': .85,
            'invested_peers': .6
        }
    ]

    updated_date = time.time() * 1000
    investment_types = [
        'bonds',
        'international-securities',
        'money-market',
        'stock',
    ]
    investment_types.sort()
    risk_tolerance = ['low', 'medium', 'high']
    retirement_age = ['35-45', '45-65', '65-75', '75-85', '85+']
    withdrawal_year = ['<5', '5-10', '10-20', '20-30', '30+', 'retirement-age']
    for combination_length in range(len(investment_types) + 1):
        for combination in itertools.combinations(investment_types,
                                                  combination_length):
            preferred_investment_types = '_'.join(combination)
            for risk in risk_tolerance:
                for retirement in retirement_age:
                    for withdrawal in withdrawal_year:
                        for _ in range(random.randint(1, 20)):
                            recommendation = _generate_recommendation(risk,
                                                                      preferred_investment_types,
                                                                      retirement,
                                                                      withdrawal,
                                                                      updated_date)
                            session.execute(
                                insert_recommendation.bind(recommendation))


def insert_portfolios():
    print 'Seeding portfolios and history...'
    insert_history = session.prepare('''
        INSERT INTO ticker.history
            (email_address, date, buy, exchange, name, price, quantity, symbol)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
    ''')
    insert_portfolio = session.prepare('''
        INSERT INTO ticker.portfolio
            (email_address, date, buy, exchange, name, price, quantity, symbol)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
    ''')

    email_addresses = [
        'ticker@datastax.com',
        'joaquin@datastax.com',
        'jamie.matthews@datastax.com',
        'wayne.chan@datastax.com',
        'lynn.walitsch@datastax.com',
        'luke.tillman@datastax.com',
        'mkennedy@datastax.com',
        'mrollender@datastax.com',
        'morris.stangelo@datastax.com',
        'paul.gilman@datastax.com',
        'brian.hess@datastax.com',
        'tprice@datastax.com',
        'jshook@datastax.com',
        'shaji@datastax.com'
    ]
    for email_address in email_addresses:
        i = 0
        for _ in range(random.randint(5, 10)):
            i += 1

            stock = random.choice(QUOTE_DATA)
            purchased = 0

            buy = True
            for _ in range(random.randint(2, 5)):
                i += 1

                quantity = random.randint(1, 1000)
                purchased += quantity

                value = {
                    'email_address': email_address,
                    'exchange': stock['exchange'],
                    'name': stock['name'],
                    'symbol': stock['symbol'],
                    'date': time.time() * 1000 + i,
                    'buy': buy,
                    'price': random.uniform(0.01, stock['high'] * 1.25),
                    'quantity': quantity
                }
                session.execute(insert_history.bind(value))
                session.execute(insert_portfolio.bind(value))

            buy = False
            for _ in range(random.randint(2, 5)):
                i += 1

                if purchased < 2:
                    break

                quantity = random.randint(1, purchased)
                purchased -= quantity

                value = {
                    'email_address': email_address,
                    'exchange': stock['exchange'],
                    'name': stock['name'],
                    'symbol': stock['symbol'],
                    'date': time.time() * 1000 + i,
                    'buy': buy,
                    'price': random.uniform(0.01, stock['high'] * 1.25),
                    'quantity': quantity
                }
                session.execute(insert_history.bind(value))
                session.execute(insert_portfolio.bind(value))


def insert_users():
    print 'Seeding users...'
    insert_user = session.prepare('''
        INSERT INTO ticker.user
            (email_address, preferred_investment_types, retirement_age,
            risk_tolerance, withdrawal_year)
        VALUES
            (?, ?, ?, ?, ?)
    ''')

    values = [
        {
            'email_address': 'ticker@datastax.com',
            'preferred_investment_types': ['bonds', 'international-securities',
                                           'money-market'],
            'retirement_age': '35-45',
            'risk_tolerance': 'high',
            'withdrawal_year': '30+'
        }
    ]

    for value in values:
        session.execute(insert_user.bind(value))


insert_quotes()
insert_recommendations()
insert_portfolios()
insert_users()
