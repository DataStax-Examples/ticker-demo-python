CREATE KEYSPACE ticker WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'Analytics': '1',
  'Solr': '1'
};

CREATE TABLE ticker.quotes (
    exchange text,
    symbol text,
    date timestamp,
    name text,
    sector text,
    marketcap text,
    volume int,
    open double,
    close double,
    low double,
    high double,
    current double,
    PRIMARY KEY ((exchange, symbol), date)
) WITH CLUSTERING ORDER BY (date DESC);

CREATE TABLE ticker.latest (
    exchange text,
    symbol text,
    date timestamp,
    name text,
    sector text,
    marketcap text,
    volume int,
    open double,
    close double,
    low double,
    high double,
    current double,
    PRIMARY KEY ((exchange, symbol))
);

CREATE TABLE ticker.user (
    email_address text,
    name text,
    password_hash text,
    risk_tolerance text,
    preferred_investment_types list<text>,
    retirement_age text,
    withdrawal_year text,
    PRIMARY KEY ((email_address))
);

CREATE TABLE ticker.history (
    email_address text,
    date timestamp,
    buy boolean,
    exchange text,
    symbol text,
    name text,
    price double,
    quantity int,
    PRIMARY KEY ((email_address), date)
) WITH CLUSTERING ORDER BY (date DESC);

CREATE TABLE ticker.portfolio (
    email_address text,
    exchange text,
    symbol text,
    date timestamp,
    name text,
    buy boolean,
    price double,
    quantity int,
    PRIMARY KEY ((email_address), exchange, symbol, date)
) WITH CLUSTERING ORDER BY (exchange ASC, symbol ASC, date DESC);

CREATE TABLE ticker.recommendations (
    risk_tolerance text,
    preferred_investment_types text,
    retirement_age text,
    withdrawal_year text,
    updated_date timestamp,
    recommendation_id uuid,
    exchange text,
    symbol text,
    name text,
    buy boolean,
    quantity int,
    projected_growth double,
    invested_peers double,
    PRIMARY KEY ((risk_tolerance, preferred_investment_types, retirement_age, withdrawal_year), updated_date, recommendation_id)
) WITH CLUSTERING ORDER BY (updated_date DESC);
