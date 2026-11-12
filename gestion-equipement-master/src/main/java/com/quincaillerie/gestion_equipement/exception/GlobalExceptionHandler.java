package com.quincaillerie.gestion_equipement.exception;

import com.quincaillerie.gestion_equipement.dto.ErrorResponseDTO;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponseDTO error = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(this::formatFieldError)
                .toList();

        ErrorResponseDTO error = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "Un ou plusieurs champs sont invalides",
                details
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> details = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .toList();
        return error(HttpStatus.BAD_REQUEST, "Validation Failed",
                "Verifiez les informations saisies", details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDTO> handleUnreadableRequest(HttpMessageNotReadableException ex) {
        return error(HttpStatus.BAD_REQUEST, "Invalid Request",
                "Le format des donnees envoyees est invalide. Verifiez les dates, nombres et choix du formulaire", null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return error(HttpStatus.BAD_REQUEST, "Invalid Parameter",
                "La valeur fournie pour le parametre '" + ex.getName() + "' n'est pas valide", null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return error(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed",
                "Cette action n'est pas disponible pour cette ressource", null);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrityViolation(
            org.springframework.dao.DataIntegrityViolationException ex) {
        String sqlState = findSqlState(ex);
        String message = switch (sqlState == null ? "" : sqlState) {
            case "23502" -> "Une valeur obligatoire est manquante. Verifiez les champs du formulaire";
            case "23505" -> "Une valeur unique (comme un numero de serie) est deja utilisee";
            case "23503" -> "Cette operation est impossible car l'element est utilise par d'autres donnees";
            case "23514" -> "Une valeur ne respecte pas les regles autorisees";
            default -> "Impossible d'enregistrer ces donnees. Verifiez les valeurs saisies";
        };
        logger.warn("Database constraint rejected request (SQL state: {})", sqlState);
        HttpStatus status = switch (sqlState == null ? "" : sqlState) {
            case "23502", "23514" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.CONFLICT;
        };
        ErrorResponseDTO error = new ErrorResponseDTO(
                LocalDateTime.now(),
                status.value(),
                status == HttpStatus.CONFLICT ? "Conflict" : "Invalid Request",
                message,
                null
        );
        return ResponseEntity.status(status).body(error);
    }

    private String findSqlState(Throwable error) {
        Throwable cause = error;
        while (cause != null) {
            if (cause instanceof SQLException sqlException) {
                return sqlException.getSQLState();
            }
            cause = cause.getCause();
        }
        return null;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneric(Exception ex) {
        logger.error("Unexpected error while processing API request", ex);
        ErrorResponseDTO error = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Une erreur inattendue est survenue",
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgument(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, "Invalid Request",
                "Une ou plusieurs valeurs ne sont pas valides. Verifiez les informations saisies", null);
    }

    @ExceptionHandler(InvalidClientDataException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidClientData(InvalidClientDataException ex) {
        ErrorResponseDTO error = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    @ExceptionHandler(MachineIndisponibleException.class)
    public ResponseEntity<ErrorResponseDTO> handleMachineIndisponible(MachineIndisponibleException ex) {
        ErrorResponseDTO error = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflict",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    @ExceptionHandler(VenteInvalideException.class)
    public ResponseEntity<ErrorResponseDTO> handleVenteInvalide(VenteInvalideException ex) {
        ErrorResponseDTO error = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    private String formatFieldError(FieldError error) {
        String message = error.getDefaultMessage() == null ? "valeur invalide" : error.getDefaultMessage();
        return error.getField() + ": " + message;
    }

    private ResponseEntity<ErrorResponseDTO> error(
            HttpStatus status,
            String title,
            String message,
            List<String> details) {
        ErrorResponseDTO body = new ErrorResponseDTO(
                LocalDateTime.now(),
                status.value(),
                title,
                message,
                details
        );
        return ResponseEntity.status(status).body(body);
    }
}