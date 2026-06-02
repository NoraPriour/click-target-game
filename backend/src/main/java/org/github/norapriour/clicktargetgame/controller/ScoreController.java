package org.github.norapriour.clicktargetgame.controller;

import jakarta.validation.Valid;
import org.github.norapriour.clicktargetgame.dto.LeaderboardResponse;
import org.github.norapriour.clicktargetgame.dto.ScoreRequest;
import org.github.norapriour.clicktargetgame.model.Score;
import org.github.norapriour.clicktargetgame.model.User;
import org.github.norapriour.clicktargetgame.repository.ScoreRepository;
import org.github.norapriour.clicktargetgame.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/scores")
    public String saveScore(
            @Valid @RequestBody ScoreRequest scoreRequest,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow();

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
    public List<Score> getCurrentUserScores(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow();

        return scoreRepository.findByUser(user);
    }
}
