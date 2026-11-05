package com.gfg.microservices.currencyconversionservice.model;
import java.math.BigDecimal;
public class CurrencyConversion {
    private Long id;
    private String from;
    private String to;
    private BigDecimal conversionMultiple;
    private int port;
    private BigDecimal quantity;
    private BigDecimal totalCalculatedAmount;
    public CurrencyConversion(){}
    public CurrencyConversion(Long id,String from,String to,BigDecimal rate,int port,BigDecimal quantity,BigDecimal total){
        this.id=id;
        this.from=from;
        this.to=to;
        this.conversionMultiple=rate;
        this.port=port;
        this.quantity=quantity;
        this.totalCalculatedAmount=total;}
    public Long getId(){return id;}
    public String getFrom(){
        return from;}
    public String getTo(){
        return to;}
    public BigDecimal getConversionMultiple()
    {return conversionMultiple;}
    public int getPort(){return port;}
    public BigDecimal getQuantity(){return quantity;}
    public BigDecimal getTotalCalculatedAmount(){return totalCalculatedAmount;}
}
