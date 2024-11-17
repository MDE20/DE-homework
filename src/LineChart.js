import { createChart, ColorType } from 'lightweight-charts';
import React, {useEffect, useRef, useState} from 'react';

import trumpData from './polymarket_trump.json';
import bidenData from './polymarket_biden.json';
import harrisData from './polymarket_harris.json';
import eventData from './main_events_by_date.json';

function formatUnixTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // 将秒转换为毫秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


const datasets = [
    {
        data: trumpData,
        title: 'Trump',
        color: 'rgb(234, 101, 85)',
        markers: [
            {
                time: new Date(2024, 6, 13).getTime() / 1000,
                text: 'Trump Attempt',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
            {
                time: new Date(2024, 6, 15).getTime() / 1000,
                text: 'Vance as VP',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 7, 15).getTime() / 1000,
                text: 'VP Debate Set',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
            {
                time: new Date(2024, 7, 23).getTime() / 1000,
                text: 'Kennedy Backs Trump',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 8, 10).getTime() / 1000,
                text: 'Trump Debate Loss',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 8, 15).getTime() / 1000,
                text: 'Trump Attacked',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
            {
                time: new Date(2024, 9, 1).getTime() / 1000,
                text: 'Vance Debate Win',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 9, 20).getTime() / 1000,
                text: 'Trump at McD’s',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 9, 30).getTime() / 1000,
                text: 'Trump Drives Truck',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 10, 1).getTime() / 1000,
                text: 'Abortion Issue',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
        ]
    },
    {
        data: bidenData,
        title: 'Biden',
        color: 'rgb(189, 189, 189)',
        markers: [
            {
                time: new Date(2024, 2, 12).getTime() / 1000,
                text: 'Biden Nominated',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 5, 27).getTime() / 1000,
                text: 'Biden Debate Loss',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 6, 17).getTime() / 1000,
                text: 'Biden COVID News',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 6, 18).getTime() / 1000,
                text: 'Biden Exit Talks',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
            {
                time: new Date(2024, 6, 21).getTime() / 1000,
                text: 'Biden Exits',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
        ],
    },
    {
        data: harrisData,
        title: 'Harris',
        color: 'rgb(53, 110, 248)',
        markers: [
            {
                time: new Date(2024, 6, 22).getTime() / 1000,
                text: 'Harris Enters Race',
                position: 'aboveBar',
                color: '#f68410',
                shape: 'arrowDown',
            },
            {
                time: new Date(2024, 8, 22).getTime() / 1000,
                text: 'Harris Confirmed',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
            {
                time: new Date(2024, 9, 29).getTime() / 1000,
                text: 'Biden: Trash Voters',
                position: 'belowBar',
                color: '#f68410',
                shape: 'arrowUp',
            },
        ],
    }
]

export const ChartComponent = props => {
    const datasets = props.data;
    const [canShowTooltip, setCanShowTooltip] = useState(false);
    const [tooltipX, setTooltipX] = useState(0);
    const [tooltipTime, setTooltipTime] = useState(0);
    const [tooltipItems, setTooltipItems] = useState([]);
    // const [news, setNews] = useState([]);

    const chartContainerRef = useRef();
    const toolTipWidth = 96;

    useEffect(
        () => {
            if (!datasets.length) return;

            const handleResize = () => {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            };

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: 'white' },
                    textColor: 'black',
                    attributionLogo: false,
                },
                width: chartContainerRef.current.clientWidth,
                height: 500,
            });

            chart.applyOptions({
                leftPriceScale: {
                    visible: true,
                    borderVisible: false,
                },
                rightPriceScale: {
                    visible: false,
                },
                crosshair: {
                    horzLine: {
                        visible: false,
                        labelVisible: true,
                    },
                    vertLine: {
                        visible: true,
                        style: 0,
                        width: 2,
                        color: 'rgba(32, 38, 46, 0.1)',
                        labelVisible: false,
                    },
                },
                grid: {
                    vertLines: {
                        visible: false,
                    },
                    horzLines: {
                        visible: false,
                    },
                },
                localization: {
                    locale: 'en-US',
                },
            });

            const newSeries = props.data.map(dataset => {
                const lineSeries = chart.addLineSeries({
                    color: dataset.color,
                    lineWidth: 3,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    crossHairMarkerVisible: false,
                });

                lineSeries.setData(dataset.data);
                lineSeries.setMarkers(dataset.markers || []);
                lineSeries.priceScale().applyOptions({
                    scaleMargins: {
                        top: 0.3,
                        bottom: 0.25
                    }
                });

                return {
                    series: lineSeries,
                    title: dataset.title,
                    color: dataset.color,
                }
            });

            const toolTipWidth = 96;

            chart.subscribeCrosshairMove(param => {
                if (!chartContainerRef.current) return;

                if (
                    param.point === undefined ||
                    !param.time ||
                    param.point.x < 0 ||
                    param.point.x > chartContainerRef.current.clientWidth ||
                    param.point.y < 0 ||
                    param.point.y > chartContainerRef.current.clientHeight
                ) {
                    setCanShowTooltip(false);
                    setTooltipTime(0);
                } else {
                    // time will be in the same format that we supplied to setData.
                    // thus it will be YYYY-MM-DD
                    setTooltipTime(param.time);
                    setCanShowTooltip(true);

                    const results = []
                    newSeries.forEach(item => {
                        const data = param.seriesData.get(item.series);
                        if (data) {
                            results.push([item.title, data.value, item.color]);
                        }
                    })
                    results.sort((a, b) => (b[1] - a[1]));
                    setTooltipItems(results);

                    let left = param.point.x; // relative to timeScale
                    const timeScaleWidth = chart.timeScale().width();
                    const priceScaleWidth = chart.priceScale('left').width();
                    const halfTooltipWidth = toolTipWidth / 2;
                    left += priceScaleWidth - halfTooltipWidth;
                    left = Math.min(left, priceScaleWidth + timeScaleWidth - toolTipWidth);
                    left = Math.max(left, priceScaleWidth);

                    setTooltipX(left);
                }
            });

            chart.timeScale().fitContent();

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);

                chart.remove();
            };
        },
        [datasets.length, props.data]
    );

    const handleClick = () => {
        if (tooltipTime) {
            const news = eventData.filter(item => item.date === formatUnixTimestamp(tooltipTime));
            props.setEvent(news);
        }
    }


    return (
        <div
            onClick={handleClick}
            ref={chartContainerRef}
        >
            {
                canShowTooltip && (
                    <div
                         style={{
                            width: `${toolTipWidth}px`, // 动态插值
                            height: '300px',
                            position: 'absolute',
                            padding: '8px',
                            boxSizing: 'border-box', // 驼峰命名
                            fontSize: '12px',
                            textAlign: 'left',
                            zIndex: 1000,
                            top: '100px',
                            left: tooltipX + 'px',
                            pointerEvents: 'none',
                            borderRadius: '4px 4px 0px 0px',
                            borderBottom: 'none',
                            boxShadow: '0 2px 5px 0 rgba(117, 134, 150, 0.45)',
                            background: 'rgba(255, 255, 255, 0.5)', // 修正动态值插入
                            color: 'black',
                            borderColor: 'rgba(239, 83, 80, 1)',
                        }}>
                        {
                            tooltipItems.map(([key, value, color]) => {
                                return (
                                    <div key={key}>
                                        <div style={{color: color}}>⬤ {key}</div>
                                        <div style={{
                                            fontSize: '24px',
                                            margin: '4px 0px'
                                        }}>
                                            {Math.round(value * 100)}%
                                        </div>
                                    </div>
                                )
                            })
                        }
                        <div>
                            {
                                formatUnixTimestamp(tooltipTime)
                            }
                        </div>
                    </div>
                )
            }
        </div>
    );
};


const LineChart = (props) => {
    const [news, setNews] = useState([]);

    return (
        <>
            <ChartComponent {...props} data={datasets} setEvent={(events) => setNews(events)} />
            <div>
                {
                    news.length && news.map(item => {
                        return (
                            <div key={'item-' + item["date"]}>
                                {item["date"]}
                                <ul>
                                    {
                                        item["main_events"].map((perNew) => {
                                            return (
                                                <li key={perNew}>{perNew}</li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        )
                    })
                }
            </div>
        </>

    );
};

export default LineChart;