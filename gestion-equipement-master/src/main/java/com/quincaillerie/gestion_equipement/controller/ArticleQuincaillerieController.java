package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.ArticleQuincaillerieRequestDTO;
import com.quincaillerie.gestion_equipement.dto.ArticleQuincaillerieResponseDTO;
import com.quincaillerie.gestion_equipement.service.ArticleQuincaillerieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles-quincaillerie")
@RequiredArgsConstructor
public class ArticleQuincaillerieController {

    private final ArticleQuincaillerieService articleService;

    @GetMapping
    public List<ArticleQuincaillerieResponseDTO> getAll() {
        return articleService.getAll();
    }

    @GetMapping("/{id}")
    public ArticleQuincaillerieResponseDTO getById(@PathVariable UUID id) {
        return articleService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ArticleQuincaillerieResponseDTO create(@Valid @RequestBody ArticleQuincaillerieRequestDTO dto) {
        return articleService.create(dto);
    }

    @PutMapping("/{id}")
    public ArticleQuincaillerieResponseDTO update(@PathVariable UUID id, @Valid @RequestBody ArticleQuincaillerieRequestDTO dto) {
        return articleService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        articleService.delete(id);
    }
}