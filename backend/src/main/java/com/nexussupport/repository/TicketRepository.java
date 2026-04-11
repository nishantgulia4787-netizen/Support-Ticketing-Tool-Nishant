package com.nexussupport.repository;
import com.nexussupport.domain.entity.Ticket;
import com.nexussupport.domain.enums.Priority;
import com.nexussupport.domain.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    @Query("SELECT t FROM Ticket t JOIN FETCH t.user u WHERE (:status IS NULL OR t.status = :status) AND (:priority IS NULL OR t.priority = :priority) ORDER BY t.createdAt DESC")
    List<Ticket> findAllWithFilters(@Param("status") TicketStatus status, @Param("priority") Priority priority);
    long countByStatus(TicketStatus status);
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(t.ticketId, 3) AS integer)), 0) FROM Ticket t")
    int findMaxTicketSequence();
}
