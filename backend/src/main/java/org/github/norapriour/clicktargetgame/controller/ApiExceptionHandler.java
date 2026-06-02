package org.github.norapriour.clicktargetgame.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationError(
            MethodArgumentNotValidException exception
    ) {
        String field = exception.getBindingResult()
                .getFieldErrors()
                .getFirst()
                .getField();

        String message = switch (field) {
            case "username" ->
                    "Le pseudo doit contenir entre 3 et 20 caractères : lettres, chiffres, _ ou -.";
            case "password" ->
                    "Le mot de passe doit contenir entre 8 et 72 caractères.";
            case "score" ->
                    "Le score envoyé est invalide.";
            default ->
                    "Les données envoyées sont invalides.";
        };

        return ResponseEntity.badRequest().body(message);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials() {
        return ResponseEntity
                .status(401)
                .body("Pseudo ou mot de passe invalide.");
    }
}