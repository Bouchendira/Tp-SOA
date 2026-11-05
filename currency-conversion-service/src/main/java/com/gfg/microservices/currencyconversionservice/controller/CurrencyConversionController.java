package com.gfg.microservices.currencyconversionservice.controller;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.gfg.microservices.currencyconversionservice.model.CurrencyConversion;
import com.gfg.microservices.currencyconversionservice.service.CurrencyConversionService;
@RestController public class CurrencyConversionController {
    @Autowired
    private CurrencyConversionService service;
    @GetMapping("/currency-conversion/from/{from}/to/{to}/quantity/{quantity}")
    public CurrencyConversion convertCurrency(@PathVariable String from,@PathVariable String to,@PathVariable BigDecimal quantity){
        return service.convert(from,to,quantity);
    }
}
