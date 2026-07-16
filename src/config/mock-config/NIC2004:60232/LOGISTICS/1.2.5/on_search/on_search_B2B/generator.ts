import { removeTagsByCodes } from "../../../../../../../utils/generic-utils";
import { Input, SessionData } from "../../../../session-types";

const TatMapping: any = {
  "Immediate Delivery": { code: "PT60M", day: 0, pickupTime: "PT15M" },
  "Same Day Delivery": { code: "PT4H", day: 0, pickupTime: "PT1H" },
  "Next Day Delivery": { code: "P1D", day: 1, pickupTime: "PT4H" },
  "Standard Delivery": { code: "P5D", day: 5, pickupTime: "PT12H" },
  "Express Delivery": { code: "P3D", day: 3, pickupTime: "P1D" },
  "Instant Delivery": { code: "PT10M", day: 0, pickupTime: "PT2M" },
};

function getDateFromToday(days: number) {
  const today = new Date();
  today.setDate(today.getDate() + days);
  return today.toISOString().split("T")[0];
}

export async function on_search_B2B_logistics(existingPayload: any, sessionData: SessionData, inputs: Input | undefined, action_id: string) {
  console.log("session data in on_search b2b logistics", JSON.stringify(sessionData));

  const fulfillments: any = [];

  const deliveryFulfillment = sessionData?.fulfillment
  console.log("deliveryFulfillment", JSON.stringify(deliveryFulfillment));
  deliveryFulfillment.id = "F1"
  const items: any[] = [];

  const categoriesData = {
    id: sessionData.category_id,
    time: {
      label: "TAT",
      duration: TatMapping[sessionData?.category_id as string].code,
      timestamp: getDateFromToday(
        TatMapping[sessionData?.category_id as string].day
      ),
    },
  };
  existingPayload.message.catalog["bpp/providers"][0].categories[0] =
    categoriesData;

  if (deliveryFulfillment?.type === "FTL") {
    items.push(
      {
        id: "I1",
        category_id: "Standard Delivery",
        parent_item_id: "",
        fulfillment_id: "F1",
        descriptor: {
          name: "32ft Open Truck FTL",
          short_desc: "Open body full truck load",
          long_desc: "Suitable for general cargo, hazardous goods allowed"
        },
        price: {
          currency: "INR",
          value: "16500.00"
        }
      },
      {
        id: "I2",
        parent_item_id: "I1",
        category_id: "Standard Delivery",
        fulfillment_id: "F2",
        descriptor: {
          name: "RTO quote",
          short_desc: "RTO quote",
          long_desc: "RTO quote"
        },
        price: {
          currency: "INR",
          value: "8000.50"
        },
        time: {
          label: "TAT",
          duration: "P5D",
          timestamp: "2024-11-20"
        }
      }
    );
  }

  if (deliveryFulfillment?.type === "PTL") {
    console.log("in this");

    items.push(
      {
        id: "I1",
        category_id: "Standard Delivery",
        parent_item_id: "",
        fulfillment_id: "F1",
        descriptor: {
          name: "Partial Truck Load",
          short_desc: "Temperature controlled cold chain",
          long_desc: "Maintains 0 to 4 Celsius"
        },
        price: {
          currency: "INR",
          value: "18500.00"
        }
      },
      {
        id: "I2",
        parent_item_id: "I1",
        category_id: "Standard Delivery",
        fulfillment_id: "F2",
        descriptor: {
          name: "RTO quote",
          short_desc: "RTO quote",
          long_desc: "RTO quote"
        },
        price: {
          currency: "INR",
          value: "8000.50"
        },
        time: {
          label: "TAT",
          duration: "P5D",
          timestamp: "2024-11-20"
        }
      }
    );
  }
  existingPayload.message.catalog
  fulfillments.push(deliveryFulfillment);
  // Check if RTO already exists
  const hasRTO = fulfillments.some((f: any) => f.type === "RTO");

  if (!hasRTO) {
    fulfillments.push({
      id: "F2",
      type: "RTO"
    });
  }

  existingPayload.message.catalog["bpp/providers"][0].fulfillments = fulfillments;
  existingPayload.message.catalog["bpp/providers"][0].items = items;
  existingPayload.message.catalog["bpp/providers"][0].items =
    existingPayload.message.catalog["bpp/providers"][0].items.map(
      (item: any) => {
        item.time = {
          label: "TAT",
          duration: TatMapping[sessionData.category_id as string].code,
          timestamp: getDateFromToday(
            TatMapping[sessionData.category_id as string].day
          ),
        };

        return item;
      }
    );
  return existingPayload;

}