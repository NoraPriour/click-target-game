package org.github.norapriour.clicktargetgame.controller;

import org.github.norapriour.clicktargetgame.dto.LeaderboardResponse;
import org.github.norapriour.clicktargetgame.dto.ScoreRequest;
import org.github.norapriour.clicktargetgame.model.Score;
import org.github.norapriour.clicktargetgame.model.User;
import org.github.norapriour.clicktargetgame.repository.ScoreRepository;
import org.github.norapriour.clicktargetgame.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ScoreController {
    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;


    public ScoreController(ScoreRepository scoreRepository, UserRepository userRepository) {
        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/scores")
    public String saveScore(@RequestBody ScoreRequest scoreRequest) {
        Optional<User> existingUser = userRepository.findByUsername(scoreRequest.getUsername());

        if (existingUser.isEmpty()) {
            return "User not found";
        }

        User user = existingUser.get();
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

    @GetMapping("/scores/{username}")
    public List<Score> getScoresByUsername(@PathVariable String username) {
        Optional<User> existingUser = userRepository.findByUsername(username);

        if (existingUser.isEmpty()) {
            return List.of();
        }

        User user = existingUser.get();

        return scoreRepository.findByUser(user);
    }
}
