DROP DATABASE IF EXISTS devoteMe;
CREATE DATABASE IF NOT EXISTS devoteMe;
USE devoteMe;

CREATE TABLE clients (
	clientKey VARCHAR(30) NOT NULL, -- A unique set of numbers
    guildId VARCHAR(18) NOT NULL, -- Discord Guild ID
    PRIMARY KEY (clientKey)
);

CREATE TABLE devotion (
	clientKey VARCHAR(30) NOT NULL,
    devotionChannel VARCHAR(19),
    devotionTime VARCHAR(19),
    PRIMARY KEY (clientKey)
);

CREATE TABLE votd (
	clientKey VARCHAR(30) NOT NULL,
    votdChannel VARCHAR(19),
    votdTime VARCHAR(19),
    PRIMARY KEY (clientKey)
);