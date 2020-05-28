#*WIP*

#Stock Tick Demo Application
A short few sentences describing what is the purpose of the example and what the user will learn

e.g.
This application shows how to use configure your NodeJs application to connect to DDAC/Cassandra/DSE or an Apollo database at runtime.

Contributor(s): [Peyton Casper](https://github.com/peytoncasper)

## Objectives

* To demonstrate how Cassandra and Datastax can be used to solve IoT data management issues.
  
## Project Layout

* [ticker.cql](/cql/ticker.cql) - Sets up the the schema for the ticker data.
* [stock_seed_data.csv](/seeding/stock_seed_data.csv) - CSV file of data to populate ticker tables.
* [seed.py](/seeding/seed.py) - Loads the initial seed data.
* [stream.py](/seeding/stream.py) - Streams in tick data from stock_seed_data.csv

## How this Works
A description of how this sample works and how it demonstrates the objectives outlined above

## Setup and Running

### Prerequisites
The prerequisites required for this application to run

e.g.
* NodeJs version 8
* A DSE 6.7 Cluster
* Schema added to the cluster

### Running
The steps and configuration needed to run and build this application

e.g.
To run this application use the following command:

`node app.js`

This will produce the following output:

`Connected to cluster with 3 host(s) ["XX.XX.XX.136:9042","XX.XX.XX.137:9042","XX.XX.XX.138:9042"]`

