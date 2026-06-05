package org.github.norapriour.clicktargetgame.repository;

import org.github.norapriour.clicktargetgame.model.Score;
import org.github.norapriour.clicktargetgame.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByUserOrderByDateDesc(User user, Pageable pageable);

    List<Score> findByUserOrderByScoreDesc(User user, Pageable pageable);

    List<Score> findTop10ByOrderByScoreDesc();
}
