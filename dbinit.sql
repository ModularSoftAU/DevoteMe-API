DROP DATABASE IF EXISTS devoteMe;
CREATE DATABASE IF NOT EXISTS devoteMe;
USE devoteMe;

CREATE TABLE clients (
	clientKey VARCHAR(30) NOT NULL, -- A unique set of numbers
    guildId VARCHAR(18) NOT NULL, -- Discord Guild ID
    timezone TEXT,
    PRIMARY KEY (clientKey)
);

CREATE TABLE devotion (
	clientKey VARCHAR(30) NOT NULL,
    devotionChannel VARCHAR(19),
    devotionTimeHour TEXT,
    devotionTimeMinute TEXT,
    PRIMARY KEY (clientKey)
);

CREATE TABLE votd (
	clientKey VARCHAR(30) NOT NULL,
    votdChannel VARCHAR(19),
    votdTimeHour TEXT,
    votdTimeMinute TEXT,
    PRIMARY KEY (clientKey)
);

CREATE TABLE prayer (
	clientKey VARCHAR(30) NOT NULL,
    prayerUserId VARCHAR(19),
    prayerChannel VARCHAR(19),
    prayerAnonymous BOOLEAN DEFAULT 0,
    PRIMARY KEY (clientKey)
);