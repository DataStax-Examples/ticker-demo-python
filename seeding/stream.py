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


def stream_quotes():
    print 'Streaming quotes and latest...'
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

    while True:
        date = time.time() * 1000
        for row in QUOTE_DATA:
            row['date'] = date
            row['current'] = random.uniform(row['low'], row['high'])

            session.execute_async(insert_quote.bind(row))
            session.execute_async(insert_latest.bind(row))
        print '.'
        # time.sleep(1)


stream_quotes()
