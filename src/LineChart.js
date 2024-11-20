import { createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

import trumpData from './polymarket_trump.json';
import bidenData from './polymarket_biden.json';
import harrisData from './polymarket_harris.json';
import mainEventData from './main_events_by_date.json';
import impactfulEvents from './modified_file.json';

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
        markers: [],
    },
    {
        data: bidenData,
        title: 'Biden',
        color: 'rgb(189, 189, 189)',
        markers: [],
    },
    {
        data: harrisData,
        title: 'Harris',
        color: 'rgb(53, 110, 248)',
        markers: [],
    },
];


// 处理主要事件数据并生成标记
function processMainEventData(eventData, datasets) {
    eventData.forEach(event => {
        const eventTime = new Date(event.date).getTime() / 1000;
        const dataset = datasets.find(ds => ds.title === event.impact_on);
        if (dataset) {
            const closestDataPoint = dataset.data.reduce((prev, curr) => 
                Math.abs(curr.time - eventTime) < Math.abs(prev.time - eventTime) ? curr : prev
            );

            dataset.markers.push({
                time: closestDataPoint.time,
                position: 'inBar',
                color: dataset.color,
                shape: 'circle',
                size: 1.5,
            });
        }
    });
}

processMainEventData(impactfulEvents, datasets);

const ChartComponent = (props) => {
    const { data: datasets } = props;
    const [canShowTooltip, setCanShowTooltip] = useState(false);
    const [tooltipX, setTooltipX] = useState(0);
    const [tooltipTime, setTooltipTime] = useState(0);
    const [tooltipItems, setTooltipItems] = useState([]);
    const [tooltipEventTitle, setTooltipEventTitle] = useState('');
    const [tooltipImage, setTooltipImage] = useState(''); 
    const chartContainerRef = useRef();
    const toolTipWidth = 256;

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // 转换为毫秒
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(2); // 取最后两位数
        return `${day}/${month}/${year}`; // 返回想要的格式
    };

    useEffect(() => {
        if (!datasets.length) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
                attributionLogo: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            priceScale: {
                autoScale: true,
            },
            
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

        const newSeries = datasets.map(dataset => {
            const lineSeries = chart.addLineSeries({
                color: dataset.color,
                lineWidth: 3,
                priceLineVisible: false,
                lastValueVisible: false,
                crossHairMarkerVisible: false,
            });

            lineSeries.setData(dataset.data);
            const sortedMarkers = dataset.markers.sort((a, b) => a.time - b.time);
            lineSeries.setMarkers(sortedMarkers);

            return {
                series: lineSeries,
                title: dataset.title,
                color: dataset.color,
            };
        });

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
                setTooltipEventTitle('');
                setTooltipImage(''); // 隐藏图片
            } else {
                setTooltipTime(param.time); // 确保 param.time 是秒
                setCanShowTooltip(true);

                const results = [];
                let foundEvent = false;

                newSeries.forEach(item => {
                    const data = param.seriesData.get(item.series);
                    if (data) {
                        results.push([item.title, data.value, item.color]);

                        const isValidHover = param.seriesData.has(item.series) && data.value !== undefined;

                        if (isValidHover) {
                            const formattedParamDate = formatDate(param.time); // 格式化悬浮时间
                        
                            const eventInfo = impactfulEvents.find(event => {
                                const eventDate = formatDate(new Date(event.date).getTime() / 1000); // 格式化事件日期
                                return eventDate === formattedParamDate; // 比较格式化后的日期
                            });
                        
                            if (eventInfo) {
                                const match = eventInfo.event.match(/\[(.*?)\]/);
                                const eventTitle = match ? match[1] : "Unknown Event";
                                setTooltipEventTitle(`${eventTitle}`);
                                setTooltipImage(eventInfo.image); // 设置图片
                                foundEvent = true;
                            }
                        }
                    }
                });

                if (!foundEvent) {
                    setTooltipEventTitle('');
                    setTooltipImage('');
                }

                results.sort((a, b) => (b[1] - a[1]));
                setTooltipItems(results);

                let left = param.point.x;
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
        const currentChartContainerRef = chartContainerRef.current;
        window.addEventListener('resize', () => {
            chart.resize(currentChartContainerRef.clientWidth, 500);
        });

        return () => {
            window.removeEventListener('resize', () => {
                chart.resize(currentChartContainerRef.clientWidth, 500);
            });
            chart.remove();
        };
    }, [datasets, props.data]);

    const handleClick = () => {
        if (tooltipTime) {
            const news = mainEventData.filter(item => item.date === formatUnixTimestamp(tooltipTime));
            props.setEvent(news);
        }
    }

    return (
        <div onClick={handleClick} ref={chartContainerRef} style={{ position: 'relative' }}>
            {canShowTooltip && (
                <div
                    style={{
                        width: `${toolTipWidth}px`,
                        height: 'auto',
                        position: 'absolute',
                        padding: '8px',
                        boxSizing: 'border-box',
                        fontSize: '12px',
                        zIndex: 1000,
                        top: '100px',
                        left: tooltipX + 'px',
                        pointerEvents: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 2px 5px 0 rgba(117, 134, 150, 0.45)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: 'black',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            {tooltipItems.map(([key, value, color]) => (
                                <div key={key}>
                                    <div style={{ color }}>{`⬤ ${key}`}</div>
                                    <div style={{ fontSize: '16px', margin: '4px 0px' }}>
                                        {Math.round(value * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        {tooltipImage && (
                            <img 
                                src={tooltipImage} 
                                alt="Event" 
                                style={{ width: '180px', height: '100px', marginLeft: '10px' }} 
                            />
                        )}
                    </div>
                    {tooltipEventTitle && (
                        <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                            {tooltipEventTitle}
                        </div>
                    )}
                    <div>
                    {formatDate(tooltipTime)}
                </div>
                </div>
            )}
        </div>
    );
};

const LineChart = (props) => {
    const [news, setNews] = useState([]);

    return (
        <>
            <ChartComponent {...props} data={datasets} setEvent={events => setNews(events)} />
            <div>
                {news.length > 0 && news.map(item => (
                    <div key={'item-' + item["date"]}>
                        {item["date"]}
                        <ul>
                            {item["main_events"].map(perNew => (
                                <li key={perNew}>{perNew}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
};

export default LineChart;