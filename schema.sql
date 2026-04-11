-- =============================================================
-- Nexus Support :: Reference SQL schema
-- Matches the Spring Boot entities and service-layer ticket ID logic.
-- =============================================================

DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_name UNIQUE (name)
);

CREATE TABLE tickets (
    ticket_id VARCHAR(10) NOT NULL,
    user_id BIGINT NOT NULL,
    issue_description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_tickets PRIMARY KEY (ticket_id),
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT chk_tickets_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_tickets_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED'))
);

INSERT INTO users (name) VALUES ('Alice Johnson'), ('Bob Smith');

INSERT INTO tickets (ticket_id, user_id, issue_description, priority, status)
VALUES
    ('T-001', 1, 'Cannot login to the system', 'HIGH', 'OPEN'),
    ('T-002', 2, 'Payment failed on checkout', 'CRITICAL', 'IN_PROGRESS'),
    ('T-003', 1, 'Profile picture not uploading', 'LOW', 'CLOSED');
