var orderbook = {   111: 13,
    110: 20,
    109: 27,
    108: 49,
    107: 58,
    106: 75,
    104: 89,
    103: 69,
    102: 43,
    101: 27,
    100: 11,
    99: 3
};

function averagePriceOfOrderBook( currentOrderbook )    {
    var total = 0;
    var count = 0;

    for( var strike in Object.keys( currentOrderbook ) ) {
        total += strike;
        count++;
    }

    return ( total / count );
}

function averageWeightedPriceOfOrderBook( currentOrderbook )    {
    var total = 0;
    var totalOrders = 0;

    for( var strike in Object.keys( currentOrderbook ) ) {
        total += strike * orderbook[ strike ];
        totalOrders += orderbook[ strike ];
    }

    return ( total / totalOrders );
}

function hedgeBestPrice( inputs )   {
    // inputs.tenor = either "1W", "EOM", or "EOQ"
    // inputs.quantity = how many BTC they want to hedge
    // inputs.currentP = current price of BTC
    // Need help connecting to the Orderbook DB Val...

    var orderbook = { }; // request the orderbook

    var orderbookQ = { };

    var lowestStrike, lowestStrikeQuantity;

    for( var strike in Object.keys( orderbook ) ) {
        if( orderbook[ strike ].direction === 0 )    {
            if( orderbookQ[ strike ] === 0 ) {
                orderbookQ[ strike ] = orderbook[ strike ].quantity;
            }
            else    {
                orderbookQ[ strike ] += orderbook[ strike ].quantity;
            }
        }
    }

    if( averagePriceOfOrderBook( orderbook ) > averageWeightedPriceOfOrderBook( orderbook ) ) {
        for( var strike in Object.keys( orderbookQ ) ) {
            if( lowestStrike === null ) {
                lowestStrike = strike;
                lowestStrikeQuantity = orderbookQ[ strike ];
            }
            else if ( strike < lowestStrike ) {
                lowestStrike = strike;
                lowestStrikeQuantity = orderbookQ[ strike ];
            }
        }

        return lowestStrike;
    }
    else {
        var avgPrice = Math.round( averageWeightedPriceOfOrderBook( orderbook ) );

        return avgPrice;
    }
}

function hedgeChanceOfFill( inputs )    {
    // inputs.tenor = either "1W", "EOM", or "EOQ"
    // inputs.quantity = how many BTC they want to hedge
    // inputs.currentP = current price of BTC

    // request the orderbook


}