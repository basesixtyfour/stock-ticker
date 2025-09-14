const Stomp = (() => {
  const processFrame = (data) => {
    const lines = data.toString().split("\n");
    const frame = { headers: {} };

    if (lines.length > 1) {
      frame.command = lines[0];
      let x = 1;

      while (lines[x].length > 0) {
        const [key, val] = lines[x].split(":").map((s) => s.trim());
        frame.headers[key] = val;
        x++;
      }

      frame.content = lines.slice(x + 1).join("\n");
      frame.content = frame.content.slice(0, -1);
    }

    return frame;
  };

  const sendFrame = (ws, frame) => {
    let data = `${frame.command}\n`;

    const headerContent = Object.entries(frame.headers)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");

    data += `${headerContent}\n\n`;
    data += `${frame.content}\n\0`;

    ws.send(data);
    console.log("Sent frame:", data);
  };

  const sendError = (ws, message, detail) => {
    const headers = {
      message: message || "No error message given",
    };

    sendFrame(ws, {
      command: "ERROR",
      headers,
      content: detail,
    });
  };

  return { processFrame, sendFrame, sendError };
})();

export default Stomp;
