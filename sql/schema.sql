DO
$$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_mode') THEN
       DROP TYPE user_mode;
   END IF;
END
$$;

DROP TABLE IF EXISTS
    availability,
    booking,
    host_review,
    review,
    saved_listings,
    photos,
    message,
    hosts,
    guests,
    listing,
    locations,
    "user"
CASCADE;

CREATE TYPE user_mode AS ENUM ('guest','host');

CREATE TABLE "user" (
    username        VARCHAR(50) PRIMARY KEY,
    password        VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL,
    mode            user_mode   NOT NULL
);

CREATE TABLE locations (
    location_id         SERIAL PRIMARY KEY,
    loc_type            TEXT,
    zip_code            INT          NOT NULL,
    city                VARCHAR(50)  NOT NULL,
    state               VARCHAR(15)  NOT NULL,
    street              VARCHAR(50)  NOT NULL,
    number_of_listings  INT,
    UNIQUE (zip_code, city, state, street)          -- natural address key
);

CREATE TABLE listing (
    listing_id      SERIAL PRIMARY KEY,
    price           NUMERIC(10,2),
    description     TEXT,
    contact_info    VARCHAR(100),
    host_username   VARCHAR(50),
    location_id     INT UNIQUE,
    CONSTRAINT listing_host_fk
        FOREIGN KEY (host_username)  REFERENCES "user"(username),
    CONSTRAINT listing_location_fk
        FOREIGN KEY (location_id)    REFERENCES locations(location_id)
);

CREATE TABLE photos (
    photoid         SERIAL PRIMARY KEY,
    photo_time      TIME,
    f_location_id   INT,
    CONSTRAINT photos_location_fk
        FOREIGN KEY (f_location_id)  REFERENCES listing(location_id)
);

CREATE TABLE hosts (
    f_username  VARCHAR(50) PRIMARY KEY
        REFERENCES "user"(username),
    bio         TEXT,
    date        DATE,
    rating      INT
);

CREATE TABLE guests (
    f_username  VARCHAR(50) PRIMARY KEY
        REFERENCES "user"(username),
    bio         TEXT,
    date        DATE,
    rating      INT
);

CREATE TABLE booking (
    f_listing_id        INT NOT NULL
        REFERENCES listing(listing_id) ON DELETE CASCADE,
    check_in_date       DATE NOT NULL,
    check_out_date      DATE NOT NULL,
    reservation_status  TEXT,
    reservation_confirmation TEXT,
    duration            INT,
    PRIMARY KEY (f_listing_id, check_in_date, check_out_date)
);

CREATE TABLE availability (
    availability    DATE NOT NULL,
    f_listing_id    INT  NOT NULL
        REFERENCES listing(listing_id) ON DELETE CASCADE,
    PRIMARY KEY (availability, f_listing_id)
);

CREATE TABLE saved_listings (
    listings    INT         NOT NULL
        REFERENCES listing(listing_id) ON DELETE CASCADE,
    f_username  VARCHAR(50) NOT NULL
        REFERENCES "user"(username)    ON DELETE CASCADE,
    PRIMARY KEY (listings, f_username)
);

CREATE TABLE review (
    review_text         TEXT,
    r_full_address      TEXT,
    reply               TEXT,
    f_guest_username    VARCHAR(50) NOT NULL
        REFERENCES guests(f_username),
    review_date         DATE,
    f_listing_id        INT NOT NULL
        REFERENCES listing(listing_id),
    PRIMARY KEY (f_guest_username, f_listing_id)
);

CREATE TABLE host_review (
    review_text         TEXT,
    review_date         DATE        NOT NULL,
    f_host_username     VARCHAR(50) NOT NULL
        REFERENCES hosts(f_username),
    f_guest_username    VARCHAR(50) NOT NULL
        REFERENCES guests(f_username),
    PRIMARY KEY (review_date, f_host_username, f_guest_username)
);

CREATE TABLE message (
    message_id          SERIAL PRIMARY KEY,
    text                TEXT,
    sender_id           VARCHAR(50) REFERENCES "user"(username),
    receiver_id         VARCHAR(50) REFERENCES "user"(username),
    f_host_username     VARCHAR(50) REFERENCES "user"(username),
    f_guest_username    VARCHAR(50) REFERENCES "user"(username)
);

CREATE INDEX IF NOT EXISTS idx_photos_loc         ON photos     (f_location_id);
CREATE INDEX IF NOT EXISTS idx_booking_dates      ON booking    (check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_availability_date  ON availability(availability);
CREATE INDEX IF NOT EXISTS idx_message_sender     ON message    (sender_id);
