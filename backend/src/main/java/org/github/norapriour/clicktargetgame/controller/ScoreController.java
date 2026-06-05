package org.github.norapriour.clicktargetgame.controller;

import jakarta.validation.Valid;
import org.github.norapriour.clicktargetgame.dto.LeaderboardResponse;
import org.github.norapriour.clicktargetgame.dto.ScoreRequest;
import org.github.norapriour.clicktargetgame.dto.ScoreResponse;
import org.github.norapriour.clicktargetgame.model.Score;
import org.github.norapriour.clicktargetgame.model.User;
import org.github.norapriour.clicktargetgame.repository.ScoreRepository;
import org.github.norapriour.clicktargetgame.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ScoreController {
    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;


    public ScoreController(ScoreRepository scoreRepository, UserRepository userRepository) {
        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Utilisateur introuvable."
                ));
    }

    @PostMapping("/scores")
    public String saveScore(
            @Valid @RequestBody ScoreRequest scoreRequest,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        Score score = new Score(scoreRequest.getScore(), user);
        scoreRepository.save(score);

        return "Score saved";
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardResponse> getLeaderboard() {
        return scoreRepository.findTop10ByOrderByScoreDesc()
                .stream()
                .map(score -> new LeaderboardResponse(
                        score.getUser().getUsername(),
                        score.getScore(),
                        score.getDate()
                ))
                .toList();
    }

    @GetMapping("/scores/me")
    public List<ScoreResponse> getCurrentUserScores(
            Authentication authentication,
            @RequestParam(defaultValue = "date") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        User user = getAuthenticatedUser(authentication);
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));

        List<Score> scores = switch (sort) {
            case "score" -> scoreRepository.findByUserOrderByScoreDesc(user, pageable);
            default -> scoreRepository.findByUserOrderByDateDesc(user, pageable);
        };

        return scores.stream()
                .map(score -> new ScoreResponse(
                        score.getScore(),
                        score.getDate()
                ))
                .toList();
    }
}
