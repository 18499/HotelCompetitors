$(document).ready(function(){
    var phoneEle = $("#source_phone");
    var phone = phoneEle[0].innerText;

    getHotelCompetitors(1);

    function getHotelCompetitors(page) {
        $.ajax({
            type:'get',
            url:'/competitor/' + phone + '/'+ page,
            success: function(data) {
                var compatitors = data.competitors;
                var innerDiv = '';
                for (var i = 0; i < compatitors.length; i ++) {
                    innerDiv +=
                        '<div class="side_list_item"><div class="list_item_cont">' +
                            '<span class="icon_num">' + (compatitors[i].index + 1) + '</span>' +
                            '<p class="item_title"><a class="name" title="' + compatitors[i].phone + '">' + compatitors[i].name + '</a>' +
                            '<p class="hidden item_phone">' + compatitors[i].phone + '</p>' +
                            '<p class="item_address">' + compatitors[i].address + '</p>' +
                            '<p class="item_c"><span class="item_comment_number">' + compatitors[i].commentNumber + '</span>条点评</p>'
                        + '</div></div>';
                }
                $("#hotel_list").html(innerDiv);
                var pageHtml = '';
                if (data.currPage === 1) {
                    pageHtml ='<li class="disabled"><a>上一页</a></li>';
                } else {
                    pageHtml ='<li><a class="link" name="'+ (data.currPage-1)+ '">上一页</a></li>';
                }

                if (data.currPage === data.totalPage) {
                    pageHtml +='<li class="disabled"><a>下一页</a></li>';
                } else {
                    pageHtml +='<li><a class="link" name="' + (data.currPage+1) + '">下一页</a></li>';
                }
                $("#simple_pager").html(pageHtml);

                $("a.name").click(function() {
                    // alert(this.title);
                    if ($("#compare_option").val() === '1')
                        ajaxLoadTargetSentimentStatistic(this.title);
                    else
                        ajaxLoadPlatformScoreStatistic(this.title);
                });

                $(".pager a.link").click(function() {
                    getHotelCompetitors(this.name);
                });

            },
            error: function(xhr) {
                alert(xhr.status + " " + xhr.statusText)
            }
        });
    }

    function getPhoneList() {
        var phoneList = [];
        var itemPhones = $("p.item_phone");
        for (var i = 0; i < itemPhones.length; i ++) {
            // alert(itemPhones[i].innerText);
            phoneList.push(itemPhones[i].innerText)
        }
        return phoneList
    }

    function getSinglePhoneList(single) {
        return phone === single ? [phone] : [phone, single];
    }

    /**
     * 平台评论数量
     */
    var platformCommentChart = {
        chart: {
            type: 'column'
        },
        title: {
            text: '平台评论数量对比'
        },
        subtitle: {
            text: ''
        },
        colors: ['#50B432', '#058DC7', '#ED561B', '#DDDF00',
            '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        xAxis: {
            categories: [],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: '评论数量 (条)'
            }
        },
        tooltip: {
            // head + 每个 point + footer 拼接成完整的 table
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y} 条</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                borderWidth: 0
            }
        },
        series: []
    };

    $("#platformComment").click(function() {
        // if (platformCommentChart.series.length === 0) {
            $.ajax({
                type:'post',
                data:JSON.stringify(getPhoneList()),
                url: '/competitor/platformCommentStatistics',
                contentType: 'application/json',
                success: function(data) {
                    platformCommentChart.series = data.series;
                    platformCommentChart.xAxis.categories = data.categories;
                    Highcharts.chart('container',platformCommentChart);
                },
                error: function(xhr) {
                    alert(xhr.status + " " + xhr.statusText)
                }
            });


        // } else {
        //    Highcharts.chart('container', platformCommentChart)
        // }
    });

    /**
     * 各平台平均得分
     */
    var platformScoreChart = {
        chart: {
            type: 'column'
        },
        title: {
            text: '各平台评论得分对比'
        },
        subtitle: {
            text: ''
        },
        colors: ['#50B432', '#058DC7', '#ED561B', '#DDDF00',
            '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        xAxis: {
            categories: [],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: '评论分数'
            }
        },
        tooltip: {
            // head + 每个 point + footer 拼接成完整的 table
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y} 分</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                borderWidth: 0
            }
        },
        series: []
    };

    $('#platformScore').click(function() {
        $.ajax({
            type:'post',
            data:JSON.stringify(getPhoneList()),
            url: '/competitor/platformScoreStatistics',
            contentType: 'application/json',
            success: function(data) {
                console.log(JSON.stringify(data));
                platformScoreChart.series = data.series;
                platformScoreChart.xAxis.categories = data.categories;
                Highcharts.chart('container',platformScoreChart);
            },
            error: function(xhr) {
                alert(xhr.status + " " + xhr.statusText)
            }
        });
    });

    /**
     * 评论情感分布
     */
    var commentSentimentChart =  {
        chart: {
            type: 'column'
        },
        title: {
            text: '评论观点情感分布'
        },
        xAxis: {
            categories: []
        },
        colors: ['#50B432', '#8085e9', '#ED561B', '#434348',
            '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        yAxis: {
            min: 0,
            title: {
                text: '观点总量'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>' +
            '({point.percentage:.0f}%)<br/>',
            //:.0f 表示保留 0 位小数，详见教程：https://www.hcharts.cn/docs/basic-labels-string-formatting
            shared: true
        },
        plotOptions: {
            column: {
                stacking: 'percent'
            }
        },
        series: []
    };

    $("#commentSentiment").click(function() {
        // if (commentSentimentChart.series.length === 0) {
            $.ajax({
                type:'post',
                data:JSON.stringify(getPhoneList()),
                url: '/competitor/commentSentimentStatistics',
                contentType: 'application/json',
                success: function(data) {
                    commentSentimentChart.xAxis.categories = data.categories;
                    commentSentimentChart.series = data.series;
                    Highcharts.chart('container',commentSentimentChart);
                },
                error: function(xhr) {
                    alert(xhr.status + " " + xhr.statusText)
                }
            });
        // } else {
        //     Highcharts.chart('container', commentSentimentChart)
        // }
    });

    /**
     * 目标情感分布
     */
    var targetSentimentChart = {
        chart: {
            type: 'column'
        },
        title: {
            text: '酒店评论目标情感分布'
        },
        subtitle: {
            text: ''
        },
        colors: ['#50B432', '#8085e9', '#ED561B', '#434348',
            '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        xAxis: {
            categories: [],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: '观点数量 (条)'
            }
        },
        tooltip: {
            // head + 每个 point + footer 拼接成完整的 table
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y} 条</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                borderWidth: 0
            }
        },
        series: []
    };
    /**
     * 蜘蛛图:展示效果不怎么好
     */
    var targetSentimentChartSpider = {
        chart: {
            polar: true,
            type: 'line'
        },
        title: {
            text: '酒店评论目标情感分布',
            x:-80
        },
        colors: ['#50B432', '#8085e9', '#ED561B', '#434348',
            '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        pane: {
            size: '80%'
        },
        xAxis: {
            categories: [],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },
        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },
        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
        },
        series: []
    };

    var ajaxLoadTargetSentimentStatistic = function (phone) {
        $.ajax({
            type:'post',
            data:'phone=' + phone,
            url: '/competitor/targetSentimentStatistics',
            success: function(data) {
                /*
                var len = data.series.length;
                for (var i = 0; i < len; i ++) {
                    data.series[i].pointPlacement = 'on';
                    data.series[i].data.pop();
                }

                data.categories.pop();
                console.log(data);
                */
                targetSentimentChart.series = data.series;
                targetSentimentChart.xAxis.categories = data.categories;
                Highcharts.chart('container',targetSentimentChart);
                currPhone = phone;
            },
            error: function(xhr) {
                alert(xhr.status + " " + xhr.statusText)
            }
        });
    };

    var platformScoreChartSpider = {
        chart: {
            polar: true,
            type: 'line'
        },
        title: {
            text: '酒店各平台评分',
            x:-80
        },
        colors: ['#50B432', '#8085e9', '#ED561B', '#434348',
            '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        pane: {
            size: '80%'
        },
        xAxis: {
            categories: [],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },
        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },
        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
        },
        series: []
    };
    var ajaxLoadPlatformScoreStatistic = function (phone) {
        $.ajax({
            type:'post',
            data:JSON.stringify(getSinglePhoneList(phone)),
            url: '/competitor/platformScoreSpiderStatistics',
            contentType: 'application/json',
            success: function(data) {
                platformScoreChartSpider.series = data.series;
                platformScoreChartSpider.xAxis.categories = data.categories;
                Highcharts.chart('container',platformScoreChartSpider);
                currPhone = phone;
            },
            error: function(xhr) {
                alert(xhr.status + " " + xhr.statusText)
            }
        });
    };

});