package com.gfg.microservices.currencyexchangesampleservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gfg.microservices.currencyexchangesampleservice.model.ExchangeValue;
@Repository
public interface ExchangeRepository extends JpaRepository<ExchangeValue, Long> {}
