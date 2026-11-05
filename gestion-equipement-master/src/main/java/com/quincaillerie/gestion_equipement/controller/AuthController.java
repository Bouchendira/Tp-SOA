package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.LoginRequestDTO;
import com.quincaillerie.gestion_equipement.dto.LoginResponseDTO;
import com.quincaillerie.gestion_equipement.security.EmployeDetails;
import com.quincaillerie.gestion_equipement.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO dto) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getMotDePasse())
        );

        EmployeDetails employeDetails = (EmployeDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(employeDetails.getUsername());

        return new LoginResponseDTO(
                token,
                employeDetails.getEmploye().getNom(),
                employeDetails.getEmploye().getRole()
        );
    }
}