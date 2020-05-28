__author__ = 'stevelowenthal'

from cassandra.cluster import Cluster
from cassandra.query import ordered_dict_factory
from cassandra.policies import DCAwareRoundRobinPolicy
session = None
solr_session = None
def init_cassandra(ip_addresses, keyspace, solr_dc):
    """
    Initialize Cassandra connections
    :param ip_addresses: ip addresses of Cassandra nodes
    :return:
    """
    global session
    global solr_session

    cluster = Cluster(ip_addresses)
    session = cluster.connect(keyspace)
    session.row_factory = ordered_dict_factory
    solr_cluster = Cluster(ip_addresses,
                           load_balancing_policy=DCAwareRoundRobinPolicy(
                               local_dc=solr_dc))
    solr_session = solr_cluster.connect()
    solr_session.row_factory = ordered_dict_factory
