Number.prototype.formatMoney = function () {
    var c = 2;
    var d = '.';
    var t = ',';
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "- $" : "$",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function currentValues(exchange, symbol, quantity, investment) {
    $.ajax({
        url: '/quote?exchange='+ exchange + '&symbol=' + symbol,
        timeout: 1000
    }).success(function (data) {
        $('#current-' + exchange + '-' + symbol).text(data.current.formatMoney());

        balance = data.current * quantity;
        selection = $('#balance-' + exchange + '-' + symbol);
        selection.text((balance).formatMoney());
        if (balance > 0) {
            selection.addClass('pricerising');
        } else if (balance < 0) {
            selection.addClass('pricefalling');
        }

        gain = data.current * quantity - investment;
        selection = $('#gain-' + exchange + '-' + symbol);
        selection.text((gain).formatMoney());
        if (gain > 0) {
            selection.addClass('pricerising');
        } else if (gain < 0) {
            selection.addClass('pricefalling');
        }

        change = data.current * quantity / investment;
        selection = $('#investment-change-' + exchange + '-' + symbol);
        selection.text((change).toFixed(2) + '%');
        if (change > 0) {
            selection.addClass('pricerising');
        } else if (change < 0) {
            selection.addClass('pricefalling');
        }

        return data.open;
    });
}
