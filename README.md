# Stock Tick Demo Application
There are a large number of devices that are generating, tracking, and sharing data across a variety of networks. This can be overwhelming to most data management solutions. Cassandra is a great fit for consuming lots of time-series data that comes directly from users, devices, sensors, and similar mechanisms that exist in a variety of geographic locations.

This is a small demo trading application displaying a simulated stock ticker page.

Contributor(s): [Peyton Casper](https://github.com/peytoncasper)

## Objectives

* To demonstrate how Cassandra and Datastax can be used to solve IoT data management issues.
  
## Project Layout

* [ticker.cql](/cql/ticker.cql) - Sets up the the schema for the ticker data.
* [stock_seed_data.csv](/seeding/stock_seed_data.csv) - CSV file of data to populate ticker tables.
* [seed.py](/seeding/seed.py) - Loads the initial seed data.
* [stream.py](/seeding/stream.py) - Streams in tick data from stock_seed_data.csv

## How this Works

After creating the database schema and setting up the Solr core, connect to the Cassandra cluster through the Python driver. The inital seed data will be inserted into the cluster, followed by streaming in the stock tick data. After that, start the web application and navigate to the web portal at `http://localhost:5000`

## Setup and Running

### Prerequisites

* DataStax Enterprise running in Search mode, as well as the following packages:

```
apt-get install python-pip
apt-get install python-dev
apt-get install build-essential

pip install flask
pip install blist
pip install cassandra-driver
```

### Running

#### Configuartion

To run this application you will need to include the ip address and name of your Search DC in the following files:

##### web-python/application.cfg

    DSE_CLUSTER=IP_ADDRESS_OF_NODE
    DSE_SOLR_DC=NAME_OF_SOLR_DC

##### seeding/seed.py
    
    ip_addresses = 'IP_ADDRESS_OF_NODE'
    
##### seeding/stream.py
    
    ip_addresses = 'IP_ADDRESS_OF_NODE'
    
### Create Schema

* Configure Replication
```
    CREATE KEYSPACE ticker WITH replication = {
      'class': 'NetworkTopologyStrategy',
      'NAME_OF_DC': '1',
    };
```
* set up the table schema

    `cqlsh -f cql/ticker.cql`
    
* Setup up the Solr Core
    
    `dsetool -h IP_ADDRESS_SOLR create_core ticker.latest generateResources=true`
    
### Begin streaming data    
    
* Load the seed data
```
    cd seeding
    chmod +x seed.py
    python seed.py
 ```   
* Stream in the stock tick data
    ```
    cd seeding
    chmod +x stream.py
    nohup python stream.py &
    ```
    
#### Start the Application

* Start up the web server

   `./web-python/run`
    
* Navigate to the Web Portal

    `http://localhost:5000`


