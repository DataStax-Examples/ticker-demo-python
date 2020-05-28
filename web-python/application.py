from flask import Flask

from helpers.jinjaHelper import makeURL
from routes import route
from routes.rest import rest_api
from routes.google_charts import gcharts_api
from routes.index import index_api
# from routes.web import route
from helpers.cassandra_helper import init_cassandra


app = Flask(__name__)
app.config.from_pyfile('application.cfg')

#app.register_blueprint(route)
app.register_blueprint(index_api)
app.register_blueprint(rest_api, url_prefix='/api')
app.register_blueprint(gcharts_api, url_prefix='/gcharts')
# app.register_blueprint(web_api, url_prefix='/web')

@app.template_filter('currency')
def format_currency(value):
    return "${:,.2f}".format(value)

def start():
    init_cassandra(app.config['DSE_CLUSTER'].split(','), app.config['DSE_KEYSPACE'], app.config['DSE_SOLR_DC'])

    app.run(host='0.0.0.0',
            port=5000,
            use_reloader=True,
            threaded=True)
