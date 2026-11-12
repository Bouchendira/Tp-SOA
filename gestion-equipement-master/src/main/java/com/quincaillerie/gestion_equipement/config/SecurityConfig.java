package com.quincaillerie.gestion_equipement.config;

import com.quincaillerie.gestion_equipement.security.JwtAuthFilter;
import com.quincaillerie.gestion_equipement.security.RestAccessDeniedHandler;
import com.quincaillerie.gestion_equipement.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService employeDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(employeDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new org.springframework.security.authentication.ProviderManager(provider);
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/employes/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.GET, "/api/machines/**", "/api/articles-quincaillerie/**",
                                "/api/categories/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/machines/*/etat")
                        .hasAnyRole("ADMINISTRATEUR", "MAGASINIER")
                        .requestMatchers(HttpMethod.PATCH, "/api/machines/*/affectation")
                        .hasAnyRole("ADMINISTRATEUR", "MAGASINIER", "AGENT")
                        .requestMatchers(HttpMethod.POST, "/api/machines/**", "/api/articles-quincaillerie/**",
                                "/api/categories/**", "/api/fournisseurs/**", "/api/clients/**",
                                "/api/locations/**", "/api/locations-fournisseurs/**",
                                "/api/achats/**", "/api/ventes/**")
                        .hasAnyRole("ADMINISTRATEUR", "MAGASINIER")
                        .requestMatchers(HttpMethod.PUT, "/api/machines/**", "/api/articles-quincaillerie/**",
                                "/api/categories/**", "/api/fournisseurs/**", "/api/clients/**")
                        .hasAnyRole("ADMINISTRATEUR", "MAGASINIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/machines/**", "/api/articles-quincaillerie/**",
                                "/api/categories/**", "/api/fournisseurs/**", "/api/clients/**")
                        .hasAnyRole("ADMINISTRATEUR", "MAGASINIER")
                        .requestMatchers("/api/achats/**", "/api/ventes/**", "/api/fournisseurs/**", "/api/clients/**")
                        .hasAnyRole("ADMINISTRATEUR", "MAGASINIER", "COMPTABLE")
                        .requestMatchers("/api/locations/**", "/api/locations-fournisseurs/**")
                        .hasAnyRole("ADMINISTRATEUR", "MAGASINIER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}