const commInterface = require("./classes/commInterface/CommInterface");
const ArchiveManager = require("./classes/archiveManager/ArchiveManager");

let json = {
  "5c9f8a7fd04bb119b3ad229f": {
    id: "5c9f8a7fd04bb119b3ad229f",
    name: "PAC3200",
    isActive: false,
    timeout: 500,
    ipAdress: "10.10.10.110",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        timeSample: 1,
        name: "Napiecie L1-N",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L2-N",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        id: "123456",
        timeSample: 1,
        name: "Napiecie L3-N",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L1-L2",
        offset: 7,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L2-L3",
        offset: 9,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L3-L1",
        offset: 11,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L1",
        offset: 13,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L2",
        offset: 15,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L3",
        offset: 17,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L1",
        offset: 19,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L2",
        offset: 21,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L3",
        offset: 23,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L1",
        offset: 25,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L2",
        offset: 27,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L3",
        offset: 29,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L1",
        offset: 31,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L2",
        offset: 33,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L3",
        offset: 35,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L1",
        offset: 37,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L2",
        offset: 39,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L3",
        offset: 41,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L1",
        offset: 43,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L2",
        offset: 45,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L3",
        offset: 47,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L1",
        offset: 49,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L2",
        offset: 51,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L3",
        offset: 53,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Częstotliwość",
        offset: 55,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napięcie średnie L-N",
        offset: 57,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napięcie średnie L-L",
        offset: 59,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Średni prąd",
        offset: 61,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna całkowita",
        offset: 63,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna całkowita",
        offset: 65,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna całkowita",
        offset: 67,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy całkowity",
        offset: 69,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Asymetria napięcia",
        offset: 71,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Asymetria prądu",
        offset: 73,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna pobrana - taryfa 1",
        offset: 2801,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna pobrana - taryfa 2",
        offset: 2803,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna oddana - taryfa 1",
        offset: 2805,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna oddana - taryfa 2",
        offset: 2807,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna pobrana - taryfa 1",
        offset: 2809,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna pobrana - taryfa 2",
        offset: 2811,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna oddana - taryfa 1",
        offset: 2813,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna oddana - taryfa 2",
        offset: 2815,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia pozorna - taryfa 1",
        offset: 2817,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia pozorna - taryfa 2",
        offset: 2819,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      }
    ],
    type: "mbDevice"
  },
  "5c9f8a7fd04bb119b3ad229g": {
    id: "5c9f8a7fd04bb119b3ad229g",
    name: "PAC4200",
    isActive: false,
    timeout: 500,
    ipAdress: "10.10.10.112",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        timeSample: 1,
        name: "Napiecie L1-N",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L2-N",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        id: "123456",
        timeSample: 1,
        name: "Napiecie L3-N",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L1-L2",
        offset: 7,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L2-L3",
        offset: 9,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L3-L1",
        offset: 11,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L1",
        offset: 13,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L2",
        offset: 15,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L3",
        offset: 17,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L1",
        offset: 19,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L2",
        offset: 21,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L3",
        offset: 23,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L1",
        offset: 25,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L2",
        offset: 27,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L3",
        offset: 29,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L1",
        offset: 31,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L2",
        offset: 33,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L3",
        offset: 35,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L1",
        offset: 37,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L2",
        offset: 39,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L3",
        offset: 41,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L1",
        offset: 43,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L2",
        offset: 45,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L3",
        offset: 47,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L1",
        offset: 49,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L2",
        offset: 51,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L3",
        offset: 53,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Częstotliwość",
        offset: 55,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napięcie średnie L-N",
        offset: 57,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napięcie średnie L-L",
        offset: 59,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Średni prąd",
        offset: 61,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna całkowita",
        offset: 63,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna całkowita",
        offset: 65,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna całkowita",
        offset: 67,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy całkowity",
        offset: 69,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Asymetria napięcia",
        offset: 71,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Asymetria prądu",
        offset: 73,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna pobrana - taryfa 1",
        offset: 2801,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna pobrana - taryfa 2",
        offset: 2803,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna oddana - taryfa 1",
        offset: 2805,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna oddana - taryfa 2",
        offset: 2807,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna pobrana - taryfa 1",
        offset: 2809,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna pobrana - taryfa 2",
        offset: 2811,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna oddana - taryfa 1",
        offset: 2813,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna oddana - taryfa 2",
        offset: 2815,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia pozorna - taryfa 1",
        offset: 2817,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia pozorna - taryfa 2",
        offset: 2819,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      }
    ],
    type: "mbDevice"
  },
  "5c9f8a7fd04bb119b3ad229h": {
    id: "5c9f8a7fd04bb119b3ad229h",
    name: "PAC2200",
    isActive: false,
    timeout: 500,
    ipAdress: "10.10.10.200",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        timeSample: 1,
        name: "Napiecie L1-N",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L2-N",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        id: "123456",
        timeSample: 1,
        name: "Napiecie L3-N",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L1-L2",
        offset: 7,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L2-L3",
        offset: 9,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napiecie L3-L1",
        offset: 11,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L1",
        offset: 13,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L2",
        offset: 15,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Prąd L3",
        offset: 17,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L1",
        offset: 19,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L2",
        offset: 21,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna L3",
        offset: 23,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L1",
        offset: 25,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L2",
        offset: 27,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna L3",
        offset: 29,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L1",
        offset: 31,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L2",
        offset: 33,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna L3",
        offset: 35,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L1",
        offset: 37,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L2",
        offset: 39,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy L3",
        offset: 41,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L1",
        offset: 43,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L2",
        offset: 45,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Napięcie L3",
        offset: 47,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L1",
        offset: 49,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L2",
        offset: 51,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "THD Prąd L3",
        offset: 53,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Częstotliwość",
        offset: 55,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napięcie średnie L-N",
        offset: 57,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Napięcie średnie L-L",
        offset: 59,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Średni prąd",
        offset: 61,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc pozorna całkowita",
        offset: 63,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc czynna całkowita",
        offset: 65,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Moc bierna całkowita",
        offset: 67,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Współczynnik mocy całkowity",
        offset: 69,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Asymetria napięcia",
        offset: 71,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Asymetria prądu",
        offset: 73,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna pobrana - taryfa 1",
        offset: 2801,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna pobrana - taryfa 2",
        offset: 2803,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna oddana - taryfa 1",
        offset: 2805,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia czynna oddana - taryfa 2",
        offset: 2807,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna pobrana - taryfa 1",
        offset: 2809,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna pobrana - taryfa 2",
        offset: 2811,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna oddana - taryfa 1",
        offset: 2813,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia bierna oddana - taryfa 2",
        offset: 2815,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia pozorna - taryfa 1",
        offset: 2817,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      },
      {
        timeSample: 1,
        name: "Energia pozorna - taryfa 2",
        offset: 2819,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        archived: true
      }
    ],
    type: "mbDevice"
  }
};
let json2 = {
  "5c9f8a7fd04bb119b3ad229f": {
    id: "5c9f8a7fd04bb119b3ad229f",
    name: "Test meter",
    calculationElements: [
      {
        id: "5cbca778e7bc41181cbdfa15",
        name: "test sum elements",
        type: "sumElement",
        archived: true,
        plusVariables: [{ id: "12345", factor: 2 }, { id: "12346", factor: 3 }],
        minusVariables: [{ id: "12347", factor: 4 }]
      }
    ],
    isActive: true,
    timeout: 500,
    ipAdress: "192.168.1.11",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        id: "12345",
        timeSample: 1,
        name: "Napiecie L1-N",
        archived: true,
        unit: "",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 1,
        type: "swappedFloat",
        getSingleFCode: 3,
        setSingleFCode: 16
      },
      {
        id: "12346",
        timeSample: 1,
        name: "Napiecie L2-N",
        archived: true,
        unit: "",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 2,
        type: "swappedFloat",
        getSingleFCode: 3,
        setSingleFCode: 16
      },
      {
        id: "12347",
        timeSample: 1,
        name: "Napiecie L3-N",
        archived: true,
        unit: "",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 3,
        type: "swappedFloat",
        getSingleFCode: 3,
        setSingleFCode: 16
      }
    ],
    type: "mbDevice"
  }
};

let exec = async () => {
  await commInterface.init(json2);
  commInterface.startCommunicationWithAllDevices();

  for (let device of Object.values(commInterface.Devices)) {
    device.Events.on("Refreshed", args => {
      console.log(args[2]);
      //console.log(args[1]);

      let allIds = Object.keys(args[1]);
      for (let id of allIds) {
        console.log(
          `${args[0].Name} ${args[1][id].Name}: ${args[1][id].Value}`
        );
      }
    });
  }
};

exec();

// // let am = new ArchiveManager("testDB.db");

// // let variable1Payload = {
// //   Id: "1234",
// //   Type: "float"
// // };

// // let variable2Payload = {
// //   Id: "1235",
// //   Type: "boolean"
// // };

// // let index = 0;

// // let variables = {};

// // setInterval(() => {}, 1000);
// // let max = 1000000;

// // let exec = async () => {
// //   await am.init();
// //   await am.addVariable(variable1Payload);
// //   await am.addVariable(variable2Payload);

// // for (let i = 0; i < max; i++) {
// //   variables["1235"] = i + 1000;
// //   await am.insertValues(i, variables);
// //   console.log(i);
// // }

// // console.log("ended");
// // };

// // exec();

// let getValue = async (deviceId, variableId, date) => {
//   let value = await commInterface.getVariableFromDatabase(
//     deviceId,
//     variableId,
//     date
//   );
//   console.log(value);
// };

//clearDirectory("database/test/db1");

console.log("Press any key to exit");

process.stdin.setRawMode(true);
process.stdin.resume();

// on any data into stdin
process.stdin.on("data", async function(key) {
  if (key.indexOf("q") == 0) {
    process.exit();
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("1") == 0) {
    getValue("5c9f8a7fd04bb119b3ad229f", "123456", "1555496260");
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("2") == 0) {
    11;
    getValue(200000);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("3") == 0) {
    getValue(300000);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("4") == 0) {
    getValue(400000);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("5") == 0) {
    getValue(500000);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("6") == 0) {
    getValue(600000);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("7") == 0) {
    getValue(700000);
  }
});
