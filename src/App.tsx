import { useEffect, useRef, useState } from "react";
import { getData } from "./回测数据";
import { legacyDarkTheme } from "@visactor/vchart-theme";
import VChart from "@visactor/vchart";

// 切换黑色主题
VChart.ThemeManager.registerTheme("dark", legacyDarkTheme);
VChart.ThemeManager.setCurrentTheme("dark");

const spec = getData();

spec.width = 1920;
spec.height = 1080;

function Page() {
  const domRef = useRef<HTMLCanvasElement>(null);

  const [isExport,setExport] = useState(false)

  const chartRef = useRef<VChart>();

  const initChart = () => {
    chartRef.current = new VChart(spec, { renderCanvas: domRef.current! });
    chartRef.current!.renderSync();
  };

  /**
   *
   * @param time 导出的视频时长 单位s
   */
  const exportVideo = (time: number) => {

    if(isExport) return

    setExport(true)

    const data: BlobPart[] = [];

    const canvas = document.createElement("canvas");
    canvas.style.width = "1920px";
    canvas.style.height = "1080px";

    const chart = new VChart(spec, { renderCanvas: canvas });
    chart.renderSync();

    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream, { mimeType: "video/mp4", videoBitsPerSecond: 1024 * 1024 * 10 });

    recorder.ondataavailable = function (event) {
      if (event.data && event.data.size) {
        data.push(event.data);
      }
    };

    recorder.onstop = () => {
      const url = URL.createObjectURL(new Blob(data, { type: "video/mp4" }));

      const dom = document.createElement("a");
      dom.href = url;
      dom.download = "video.mp4";
      dom.click();
      setExport(false)
    };

    recorder.start();

    setTimeout(() => {
      recorder.stop();
    }, time * 1000);
  };

  useEffect(() => {
    if (!domRef.current) return;

    initChart();
  }, [domRef.current]);

  return (
    <div>
      <div>
        <button
          style={{ marginBottom: "10px" }}
          onClick={() => {
            exportVideo(10);
          }}
        >
          {isExport ? "正在导出，请稍后":"点击导出视频"}
        </button>
      </div>
      <canvas ref={domRef}></canvas>
    </div>
  );
}

export default Page;
