package com.nexussupport.config;

import com.nexussupport.domain.entity.Ticket;
import com.nexussupport.domain.entity.User;
import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import com.nexussupport.repository.TicketRepository;
import com.nexussupport.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository, TicketRepository ticketRepository) {
        return args -> {
            User alice = findOrCreateUser(userRepository, "Alice Johnson");
            User bob = findOrCreateUser(userRepository, "Bob Smith");
            User sophia = findOrCreateUser(userRepository, "Sophia Chen");
            User marcus = findOrCreateUser(userRepository, "Marcus Rivera");
            User priya = findOrCreateUser(userRepository, "Priya Nair");
            User emma = findOrCreateUser(userRepository, "Emma Wilson");

            seedTicket(ticketRepository, "T-001", alice, "Cannot login to the system", Priority.HIGH, TicketStatus.OPEN);
            seedTicket(ticketRepository, "T-002", bob, "Payment failed on checkout", Priority.CRITICAL, TicketStatus.IN_PROGRESS);
            seedTicket(ticketRepository, "T-003", alice, "Profile picture not uploading", Priority.LOW, TicketStatus.CLOSED);
            seedTicket(ticketRepository, "T-005", sophia, "Billing page shows duplicate tax line on renewal", Priority.MEDIUM, TicketStatus.OPEN);
            seedTicket(ticketRepository, "T-006", marcus, "Two-factor code not accepted after device change", Priority.HIGH, TicketStatus.CLOSED);
            seedTicket(ticketRepository, "T-007", priya, "Need a copy of the closed chat transcript", Priority.LOW, TicketStatus.OPEN);
            seedTicket(ticketRepository, "T-008", emma, "CSV export stops after fifty rows", Priority.MEDIUM, TicketStatus.IN_PROGRESS);
            seedTicket(ticketRepository, "T-009", sophia, "Customer portal is down for EU region users", Priority.CRITICAL, TicketStatus.OPEN);
            seedTicket(ticketRepository, "T-010", priya, "SSO login loops back to the sign-in page", Priority.HIGH, TicketStatus.CLOSED);
            seedTicket(ticketRepository, "T-011", marcus, "Push notifications arrive late on the Android app", Priority.MEDIUM, TicketStatus.IN_PROGRESS);
            seedTicket(ticketRepository, "T-012", emma, "Avatar upload crops profile pictures incorrectly", Priority.LOW, TicketStatus.CLOSED);
        };
    }

    private User findOrCreateUser(UserRepository userRepository, String name) {
        return userRepository.findByNameIgnoreCase(name)
            .orElseGet(() -> userRepository.save(new User(name)));
    }

    private void seedTicket(
        TicketRepository ticketRepository,
        String ticketId,
        User user,
        String issueDescription,
        Priority priority,
        TicketStatus status
    ) {
        if (ticketRepository.findById(ticketId).isPresent()) {
            return;
        }

        Ticket ticket = new Ticket(ticketId, user, issueDescription, priority);
        if (status == TicketStatus.IN_PROGRESS || status == TicketStatus.CLOSED) {
            ticket.advanceStatus(TicketStatus.IN_PROGRESS);
        }
        if (status == TicketStatus.CLOSED) {
            ticket.advanceStatus(TicketStatus.CLOSED);
        }
        ticketRepository.save(ticket);
    }
}
