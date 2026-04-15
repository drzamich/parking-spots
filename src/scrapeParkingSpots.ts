import { ParkingSpot, Location } from "./types";

export async function scrapeParkingSpots(): Promise<ParkingSpot[]> {
  const url = "https://zdm.waw.pl/sprawy/parkowanie/parkingi-podziemne/";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const spots: Record<Location, number | null> = {
    krasinski: null,
    warynskiego: null,
  };

  let krasinskiBuffer = "";
  let warynskiegoBuffer = "";

  const rewriter = new HTMLRewriter()
    .on("span.parking-spot-krasinskich", {
      text(text) {
        krasinskiBuffer += text.text;
        if (text.lastInTextNode) {
          const val = parseInt(krasinskiBuffer.trim(), 10);
          if (!isNaN(val)) {
            spots.krasinski = val;
          }
          krasinskiBuffer = "";
        }
      },
    })
    .on("span.parking-spot-warynskiego", {
      text(text) {
        warynskiegoBuffer += text.text;
        if (text.lastInTextNode) {
          const val = parseInt(warynskiegoBuffer.trim(), 10);
          if (!isNaN(val)) {
            spots.warynskiego = val;
          }
          warynskiegoBuffer = "";
        }
      },
    });

  // Consume the stream to trigger the handlers
  await rewriter.transform(response).arrayBuffer();

  const timestamp = new Date().toISOString();
  const result: ParkingSpot[] = [];

  if (spots.krasinski !== null) {
    result.push({
      location: "krasinski",
      free_spots: spots.krasinski,
      timestamp,
    });
  }

  if (spots.warynskiego !== null) {
    result.push({
      location: "warynskiego",
      free_spots: spots.warynskiego,
      timestamp,
    });
  }

  return result;
}
