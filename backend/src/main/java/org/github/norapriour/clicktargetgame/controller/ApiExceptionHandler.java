package org.github.norapriour.clicktargetgame.controller;

import org.github.norapriour.clicktargetgame.dto.ApiMessageResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiMessageResponse> handleValidationError(
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

        return ResponseEntity.badRequest().body(new ApiMessageResponse(false, message));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiMessageResponse> handleBadCredentials() {
        return ResponseEntity
                .status(401)
                .body(new ApiMessageResponse(false, "Pseudo ou mot de passe invalide."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiMessageResponse> handleDataIntegrityViolation() {
        return ResponseEntity
                .status(409)
                .body(new ApiMessageResponse(false, "Ce pseudo est déjà utilisé."));
    }
}
