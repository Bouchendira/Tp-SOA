package com.quincaillerie.gestion_equipement.exception;

public class MachineIndisponibleException extends RuntimeException {
    public MachineIndisponibleException(String message) {
        super(message);
    }
}