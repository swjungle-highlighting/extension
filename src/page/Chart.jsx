import React, { useState } from "react";

import {
  AxisTickStrategies,
  emptyFill,
  emptyLine,
  synchronizeAxisIntervals,
  translatePoint,
  lightningChart,
  UIOrigins,
  UIElementBuilders,
  UILayoutBuilders,
  AutoCursorModes,
  Themes,
  SolidLine,
  SolidFill,
  ColorHEX,
} from "@arction/lcjs";



import { useEffect, useRef } from "react";


const CHANNELS = 3;
// const DATA_PER_CHANNEL = 5 * 1000 * 1000

// 리플레이 재생 시 1회만 재생
let REPLAY_ONLE_ONCE = true;

// 각 차트별로 x개수와 간격이 다르지만, 같은 시간을 가리키도록 하자.
// STEP_X: X좌표 간격(1밀리초)
const STEP_X_CHAT_DISTRIBUTION = 30 * 1000; // 30초
const STEP_X_VIDEO = 1000; // 1초
const STEP_X_AUDIO = 500;  // 0.5초
const STEP_X_CHAT_SUPER = 1000;  // 1초
const STEP_X_CHAT_KEYWORDS = 60 * 1000;   // 1분

// 차트 제목; 데이터리스트 인덱스 0,1,2,3,4
const TITLE0 = "Chat Flow";
const TITLE1 = "Video Frame";
const TITLE2 = "Audio Power";
const TITLE3 = "Super Chat";
const TITLE4 = "Keyword Flow";

// x축 확대축소 사용여부(boolean)
const AXIS_X_WHEEL_ZOOM = true;

// 차트 그래프 컬러 임의 조합 NUMBER
const GRAPH_COLOR_NUMBER = 999

// 차트 플레이 바의 컬러 조합
const YELLOW = "#ffcc00"
const RED = "#F00"
const BLUE = "0075ff"
const playBarColor = { basic: YELLOW, hover: RED }
const jumpBarColor = { basic: YELLOW, hover: BLUE }


/* 데이터 차트 컴포넌트 시작 */
const DataChart = (props) => {
  const { dataList } = props;

  const axisListRef = useRef({ x: undefined, y: undefined, time: undefined });
  const playBarListRef = useRef(undefined);
  const chartListRef = useRef(undefined);
  const seriesListRef = useRef(undefined);
  const dragStartRef = useRef({ isDrag: false, xValue: Number.MAX_SAFE_INTEGER });
  const clickToJumpRef = useRef({ isJump: false, jumpTime: undefined });
  const replayRef = useRef({ 
    isReplay: false, startTime: undefined, endTime: undefined,
    saveMarker: undefined,
    playingId: undefined, isPlayOnce: REPLAY_ONLE_ONCE,
    subKey: {isShiftKey: false, isCtrlKey: false},
    wordKey: {isK: false}
  });
  const dataDataRef = useRef({ isChange: false, dashboard: undefined, chartList: undefined, seriesList: undefined});
  const dragBandList = useRef(undefined);
  const whichChartRef = useRef(undefined);
  const fitActiveRef = useRef(false);
  const yMaxRef = useRef([]);
  const markerInfoRef = useRef({interruption: false, playingId: undefined, playingIndex: undefined, selectedMarkerList: []})

  // 차트별로 STEP_X 값 다르게 하기
  function whichStepX(index) {
    let step;
    switch (index) {
      case 0:
        step = STEP_X_CHAT_DISTRIBUTION;
        return step;
      case 1:
        step = STEP_X_VIDEO;
        return step;
      case 2:
        step = STEP_X_AUDIO;
        return step;
      case 3:
        step = STEP_X_CHAT_SUPER;
        return step;
      case 4:
        step = STEP_X_CHAT_KEYWORDS;
        return step;
      default:
        console.log("here is no chart step x");
    }
  }

  useEffect(()=>
  {
      console.log('chart', dataList.length)
      console.log('chart test', dataList.length!==3)
  },[dataList])

  /* 메인 차트 그리기 */
  useEffect(() => {
    if (dataList.length === 0)
    {
        return
    }
    // lcjs 생성
    const lcjs = lightningChart({
      overrideInteractionMouseButtons: {
        chartXYPanMouseButton: 0, // LMB
        chartXYRectangleZoomFitMouseButton: 2, // RMB
        axisXYZoomMouseButton: 1, //줌 드래그: RMB
        axisXYPanMouseButton: 0, // x축 좌우 이동 드래그: LMB
      },
    });

    // 대쉬보드 생성
    const dashboard = lcjs
      .Dashboard({
        container: 'test',
        numberOfColumns: 1,
        numberOfRows: CHANNELS,
        disableAnimations: true,
        theme: Themes.darkMagenta,
      })
      .setHeight(500, 1000);

    // 대쉬보드 ref 담기
    dataDataRef.current.dashboard = dashboard;

    // 기본 축 x, y 리스트
    const axisYList = new Array(CHANNELS);
    const axixXList = new Array(CHANNELS);

    // 차트 만드는 함수
    function makeChart(i, title = undefined, padding = 30, xThickness = 30, yThickness = 80) {
      let name = title;
      const chart = dashboard
        .createChartXY({
          columnIndex: 0,
          rowIndex: i,
        })
        .setPadding({ right: padding });

      // 각 차트 상단 타이틀 비우기
      chart.setTitleFillStyle(emptyFill);

      // 인덱스 따른 차트 이름 설정
      if (!title) {
        name = whichChart(i);
      }

      // 축 생성
      const axisX = chart
        .getDefaultAxisX()
        .setThickness({ min: xThickness })
        .setTickStrategy(AxisTickStrategies.Time);
      const axisY = chart.getDefaultAxisY().setTitle(`${name}`).setThickness({ min: yThickness });

      // 차트마다 축리스트에 생성된 축 담기
      axixXList[i] = axisX;
      axisYList[i] = axisY;

      // 차트 레이아웃
      const uiLayout = chart
        .addUIElement(UILayoutBuilders.Column, {
          x: chart.getDefaultAxisX(),
          y: chart.getDefaultAxisY(),
        })
        .setOrigin(UIOrigins.LeftTop)
        .setPosition({
          x: chart.getDefaultAxisX().getInterval().start,
          y: chart.getDefaultAxisY().getInterval().end,
        })
        .setMouseInteractions(false)
        .setBackground((background) => background.setStrokeStyle(emptyLine));
      chart
        .getDefaultAxisX()
        .onScaleChange((start, end) =>
          uiLayout.setPosition({
            x: start,
            y: chart.getDefaultAxisY().getInterval().end,
          })
        );
      chart
        .getDefaultAxisY()
        .onScaleChange((start, end) =>
          uiLayout.setPosition({
            x: chart.getDefaultAxisX().getInterval().start,
            y: end,
          })
        );

      return chart;
    }

    // 메인 차트 리스트 생성
    const chartList = new Array(CHANNELS).fill(0).map((_, i) => makeChart(i));

    // 차트 리스트 ref 담기
    chartListRef.current = chartList;
    dataDataRef.current.chartList = chartList;

    // axisTimeRef = 플레이 바가 담긴 리스트
    axisListRef.current.x = axixXList;
    axisListRef.current.y = axisYList;

    // charlist의 index를 통해 차트 이름을 구분하자.
    function whichChart(index) {
      // 마우스 결과박스 내용 차트 이름 넣기
      // 입력받은 데이터 순서, 현재 [ 채팅, 비디오, 오디오 ]
      let name;
      switch (index) {
        case 0:
          name = TITLE0;
          return name;
        case 1:
          name = TITLE1;
          return name;
        case 2:
          name = TITLE2;
          return name;
        case 3:
          name = TITLE3;
          return name;
        case 4:
          name = TITLE4;
          return name;
        default:
        // console.log("here is chart name");
      }
    }
    whichChartRef.current = whichChart;

    const seriesList = chartList.map((chart, i) => {
      const name = whichChart(i);
      const series = chart
        .addLineSeries({
          dataPattern: {
            pattern: "ProgressiveX",
          },
          automaticColorIndex: i * GRAPH_COLOR_NUMBER,
        })
        // 차트 y축 타이틀
        .setName(`${name}`)
        .setCursorInterpolationEnabled(false);
      return series;
    });

    synchronizeAxisIntervals(
      ...chartList.map((chart) => chart.getDefaultAxisX())
    );

    // seriesListRef = series가 담긴 리스트
    seriesListRef.current = seriesList;
    dataDataRef.current.seriesList = seriesList;
  }, [dataList]);


  /* 데이터 받아서 차트 렌더링 */
  useEffect(() => {
    if (dataList.length !== 3)
    {
        return
    }
    const chartList = chartListRef.current;
    const seriesList = seriesListRef.current;

    Promise.all(dataList.map((data, i) => { 
        if(data === undefined)
        {
            return
        }
      const STEP_X = whichStepX(i);

      const yMin = data.reduce(
        (min, cur) => Math.min(min, cur.y),
        Number.MAX_SAFE_INTEGER
      );
      const yMax = data.reduce(
        (max, cur) => Math.max(max, cur.y),
        -Number.MAX_SAFE_INTEGER
      );

      yMaxRef.current[i] = yMax;
      
      // 1번 차트 데이터들은 y 고유값으로 유지
      if (i === 0 || i === 3 || i === 4) {
        return data.map((xy) => ({
          x: xy.x * STEP_X,
          y: xy.y
        }))
      }
      
      // Map generated XY trace data set into a more realistic trading data set.
      const baseLine = 50;  // 최소값을 0, 최대값을 100으로 놓았을 때를 그래프로 그리도록 설정함.
      // const baseLine = 10 + Math.random() * 2000;
      const variationAmplitude = baseLine;
      const yIntervalHalf = (yMax - yMin) / 2;
      const yTraceBaseline = yMin + yIntervalHalf;
      return data.map((xy) => ({
        x: xy.x * STEP_X,
        y:
          baseLine +
          ((xy.y - yTraceBaseline) / yIntervalHalf) * variationAmplitude,
      }))
    })  
  ).then((receivedDataSet) => {
    if (receivedDataSet && receivedDataSet[0]) {
      seriesList.forEach((series, i) => {
        series.add(receivedDataSet[i]);
      });
    }

    // Customize chart interactions. x축 마우스인터렉션 휠 설정 여부
    chartList.forEach((chart) => {
      chart.setMouseInteractions(false);
      chart.getDefaultAxisX().setMouseInteractions(AXIS_X_WHEEL_ZOOM);
      chart
        .setMouseInteractionRectangleFit(false)
        .setMouseInteractionRectangleZoom(false);
    });

    // Create custom chart interaction for mouse dragging inside chart area.
    const xBandList = chartList.map((chart) =>
      chart.getDefaultAxisX().addBand().dispose()
    );
    chartList.forEach((chart) => {
      // 각 차트에 축 생성
      const axisX = chart.getDefaultAxisX();
      const axisY = chart.getDefaultAxisY();

      // 해당 축에 x위치 표시해주는 틱 생성
      const xTicksStart = chartList.map((chart) =>
        chart.getDefaultAxisX().addCustomTick().dispose()
      );
      const xTicksEnd = chartList.map((chart) =>
        chart.getDefaultAxisX().addCustomTick().dispose()
      );

      // chart.setMouseInteractionRectangleFit(false).setMouseInteractionRectangleZoom(false)
      chart.onSeriesBackgroundMouseDrag(
        (_, event, button, startLocation, delta) => {
          // event: 이벤트, button: 입력됨 0, startLocation: 시작좌표, delta: 드래그변화량
          // console.log('event', event, 'startLocation', startLocation, 'delta', delta);
          if (button !== 0) return;

          xBandList.forEach((band, i) => {
            const bandChart = chartList[i];

            const xAxisLocationStart = translatePoint(
              bandChart.engine.clientLocation2Engine(
                startLocation.x,
                startLocation.y
              ),
              bandChart.engine.scale,
              { x: axisX, y: axisY }
            ).x;
            const xAxisLocationNow = translatePoint(
              bandChart.engine.clientLocation2Engine(
                event.clientX,
                event.clientY
              ),
              bandChart.engine.scale,
              { x: axisX, y: axisY }
            ).x;
            // console.log('xAxisLocationStart.x', xAxisLocationStart, 'xAxisLocationNow.x', xAxisLocationNow)
            if (Math.abs(event.clientX - startLocation.x) > 10) {
              // 드래그 하고 있는 밴드(범위)을 표현하기
              band
                .restore()
                .setValueStart(xAxisLocationStart)
                .setValueEnd(xAxisLocationNow)
              // .onValueChange((band, start, end)=>console.log('band is changing', band, start, end));
              // 드래그로 확대되어 바뀐 클릭 시작 시간 값과 클릭 끝 값 3차트에서 확인
              // console.log('start', xAxisLocationStart, 'end', xAxisLocationNow)
              xTicksStart.forEach((xTick) =>
                xTick.restore().setValue(xAxisLocationStart)
              );
              xTicksEnd.forEach((xTick) =>
                xTick.restore().setValue(xAxisLocationNow)
              );
              dragStartRef.current.xValue = Math.round(
                Math.min(xAxisLocationStart, xAxisLocationNow) / 1000
              );
            } else {
              band.dispose();
            }
          });
          dragBandList.current = xBandList;
          dragStartRef.current.isDrag = true;
        }
      );
      chart.onSeriesBackgroundMouseDragStop(
        (_, event, button, startLocation) => {
          if (button !== 0 || xBandList[0].isDisposed()) return;

          // 마우스 드래그 시작과 끝 시간 값
          const xDragStart = xBandList[0].getValueStart();
          const xDragEnd = xBandList[0].getValueEnd();

          // 시작과 끝 시간 초 단위 변환
          const startTime = Math.round(xDragStart / 1000);
          const endTime = Math.round(xDragEnd / 1000);

          // 마우스 드래그 시작이 끝보다 작으면 좌->우 드래그
          if (xDragStart > xDragEnd) {
            // 마우스드래그 좌우방향 무관하게 시작과 끝 값을 크기 순으로 설정
            const xStart = Math.min(xDragStart, xDragEnd);
            const xEnd = Math.max(xDragStart, xDragEnd);

            chartList[0]
              .getDefaultAxisX()
              .setInterval(xStart, xEnd, false, true);
            xBandList.forEach((band, i) => {
              const nChart = chartList[i];
              const STEP_X = whichStepX(i);
              let yMin = 999999;
              let yMax = -999999;
              for (let x = xStart; x < xEnd; x += STEP_X) {
                const dp = receivedDataSet[i][Math.round(x / STEP_X)];
                if (dp !== undefined) {
                  yMin = Math.min(yMin, dp.y);
                  yMax = Math.max(yMax, dp.y);
                }
              }
              nChart.getDefaultAxisY().setInterval(yMin, yMax, false, true);
              band.dispose();

              console.log(
                "R->L mouse drag",
                "startTime", startTime,
                "endTime", endTime,
                "yMax", yMax,
              );
            });
            // console.log("mouse drag", "xStart", xStart, "xEnd", xEnd);
            xTicksStart.forEach((xTick) => xTick.dispose());
            xTicksEnd.forEach((xTick) => xTick.dispose());

          }
          // 위와 반대방향으로 드래그 (현재 L->R)
          else {
            // xTicks1.forEach((xTick) => xTick.restore().setValue(xDragEnd))
            console.log(
              "L->R mouse drag",
              "startTime",
              startTime,
              "endTime",
              endTime
              );
              
            // 키보드 SHIFT가 눌린 상태는 자동재생 막고 드래그만 하기
            if (replayRef.current.subKey.isShiftKey) {
              // 드래그 시, 드래그 시작으로 재생 시작, 드래그 구간 반복
              replayRef.current.isReplay = true;
              replayRef.current.startTime = startTime;
              replayRef.current.endTime = endTime;

              // 드래그 종료 시, 시간 표시 삭제
              resultTable.dispose();
              xTicksStart.forEach((xTick) => xTick.dispose());
              xTicksEnd.forEach((xTick) => xTick.dispose());
              // 북마크 재생중 벗어나도 relay 유지
            }
            // 키보드 SHIFT가 안 눌린 상태
            else {
              // 드래그 시, 드래그 시작지점에서 재생 시작, 드래그 구간 리플레이(REPLAY_ONLY_ONCE: false 일 때)
              replayRef.current.isReplay = true;
              replayRef.current.startTime = startTime;
              replayRef.current.endTime = endTime;
              // 드래그 종료 시, 시간 표시 삭제
              resultTable.dispose();
              xTicksStart.forEach((xTick) => xTick.dispose());
              xTicksEnd.forEach((xTick) => xTick.dispose());
              // 북마크 재생중 벗어나면 markers의 isPlaying 체크, relay 해제
              markerInfoRef.current.interruption = true;
            }
          }        
        }
      );

      // 차트 전체 보기 전환, x축 더블 클릭
      chart.getDefaultAxisX().onAxisInteractionAreaMouseDoubleClick((_, event) => {
        if (event.button !== 0) return;

        fitActiveRef.current = true;
        chartList.forEach((nChart) => {
          nChart.getDefaultAxisX().fit(false);
          nChart.getDefaultAxisY().fit(false);
        });
        fitActiveRef.current = false;
        // setXTicksStart(xTicksStart.map((xTick) => xTick.dispose()))
        // setXTicksEnd(xTicksEnd.map((xTick) => xTick.dispose()))
      });

      // 차트 x값 인식 onSeriesBackgroundMouseClick: 클릭
      // chart.setMouseInteractionsWhileZooming(true).MouseClickEventType = 2;
      chart.onSeriesBackgroundMouseClick((_, event, button) => {
        event.preventDefault();

        // 마우스 드래그할 때는 작동되지 않도록 lock-unlock
        if (dragStartRef.current.isDrag) {
          dragStartRef.current.isDrag = false
          return;
        }

        // 클릭 점핑, seeking 준비: clickRef 또는 pointer 둘 다 설정해서 먼저 변하는 값 빠르게 갱신
        clickToJumpRef.current.isJump = true
        // console.log(clickRef.current)
        // console.log('isDrag?', dragStartRef.current)

        const mouseLocationEngine = chart.engine.clientLocation2Engine(
          event.clientX,
          event.clientY
        );
        const mouseLocationAxisX = translatePoint(
          mouseLocationEngine,
          chart.engine.scale,
          { x: chart.getDefaultAxisX(), y: chart.getDefaultAxisY() }
        ).x;

        const playTime = Math.round(mouseLocationAxisX / 1000)
        clickToJumpRef.current.jumpTime = playTime;

        // 구간 반복 있다면 제거
        replayRef.current.isReplay = false;
        // 북마크 재생 있다면 제거
        markerInfoRef.current.interruption = true;
      });
    });

    fitActiveRef.current = false;
    // X축 범위가 바뀌면 Y축 상태 갱신
    chartList.forEach((chart, i) => {
      chart.getDefaultAxisX().onScaleChange((xStart, xEnd) => {
        if (fitActiveRef.current) return;

        const STEP_X = whichStepX(i);
        let yMin = 999999;
        let yMax = -999999;
        // let x = xStart < 0 ? 0 : xStart
        for (let x = xStart; x < xEnd; x += STEP_X) {
          const dp = receivedDataSet[i][Math.round(x / STEP_X)];
          if (dp !== undefined) {
            yMin = Math.min(yMin, dp.y);
            yMax = Math.max(yMax, dp.y);
          }
        }
        if (yMin < 999999) {
          chart.getDefaultAxisY().setInterval(yMin, yMax, false, true);
        }
      });
    });
  });

    // 커서 창 상태
    const dashboard = dataDataRef.current.dashboard;
    const resultTable = dashboard
      .addUIElement(UILayoutBuilders.Column, dashboard.engine.scale)
      .setMouseInteractions(false)
      .setOrigin(UIOrigins.LeftBottom)
      .setMargin(5);
    // const resultTableRows = new Array(1 + CHANNELS).fill(0).map(_ => resultTable.addElement(UIElementBuilders.ButtonBox))
    const resultTableRows = new Array(1)
      .fill(0)
      .map((_) => resultTable.addElement(UIElementBuilders.ButtonBox));
    resultTable.dispose();
    const xTicks = chartList.map((chart) =>
      chart.getDefaultAxisX().addCustomTick().dispose()
    );

    chartList.forEach((chart) => {
      chart.setAutoCursorMode(AutoCursorModes.disabled);
      chart.onSeriesBackgroundMouseMove((_, event) => {
        const mouseLocationEngine = chart.engine.clientLocation2Engine(
          event.clientX,
          event.clientY
        );
        const mouseLocationAxisX = translatePoint(
          mouseLocationEngine,
          chart.engine.scale,
          { x: chart.getDefaultAxisX(), y: chart.getDefaultAxisY() }
        ).x;
        resultTableRows[0].setText(
          chart.getDefaultAxisX().formatValue(mouseLocationAxisX)
        );
        // for (let i = 0; i < CHANNELS; i += 1) {
        //   const series = seriesList[i]
        //   const nearestDataPoint = series.solveNearestFromScreen(mouseLocationEngine)
        //   // 마우스 커서창에 뜨는 레전드 박스 텍스트 값
        //   resultTableRows[1 + i].setText(series.getName() + ': ' + (nearestDataPoint ? chart.getDefaultAxisY().formatValue(nearestDataPoint.location.y) + ' €?' : ''))
        // }
        resultTable.restore().setPosition(mouseLocationEngine);
        xTicks.forEach((xTick) => xTick.restore().setValue(mouseLocationAxisX));
      });
      chart.onSeriesBackgroundMouseDragStart((_, event) => {
        resultTable.dispose();
        xTicks.forEach((xTick) => xTick.dispose());
      });
      chart.onSeriesBackgroundMouseLeave(() => {
        resultTable.dispose();
        xTicks.forEach((xTick) => xTick.dispose());
      });
    });

    chartListRef.current = chartList;

    return () => {
      // Destroy chart.
      seriesList.forEach((series) => {
        series.dispose();
        series = undefined;
      });
      chartList.forEach((chart) => {
        chart.dispose();
        chart = undefined;
      });
      resultTable.dispose();
      dashboard.dispose();
      chartListRef.current = undefined
      seriesListRef.current = undefined
    };    
  }, [dataList]);


  return (
    <div id="test" className="TrippleChart"></div>
  );
};

export default React.memo(DataChart);