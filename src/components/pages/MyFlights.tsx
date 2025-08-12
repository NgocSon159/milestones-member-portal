import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { useEarnMiles } from "../EarnMilesContext";
import { 
  Plane, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Luggage,
  Ticket,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  Calculator,
  Send,
  X,
  Award,
  Info,
  HourglassIcon,
  Filter,
  Plus
} from "lucide-react";

// Vietnam Airlines miles calculation structure
const VN_MILES_STRUCTURE = {
  "Economy": {
    "Y": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "B": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "M": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "H": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "Q": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "V": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "W": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "S": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "T": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "L": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "K": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "G": { under300: 0.25, from300to600: 0.50, over600: 1.00 },
    "N": { under300: 0.25, from300to600: 0.50, over600: 1.00 }
  },
  "Premium Economy": {
    "W": { under300: 0.50, from300to600: 0.75, over600: 1.25 },
    "E": { under300: 0.50, from300to600: 0.75, over600: 1.25 }
  },
  "Business": {
    "J": { under300: 0.75, from300to600: 1.25, over600: 1.50 },
    "C": { under300: 0.75, from300to600: 1.25, over600: 1.50 },
    "D": { under300: 0.75, from300to600: 1.25, over600: 1.50 },
    "I": { under300: 0.75, from300to600: 1.25, over600: 1.50 },
    "O": { under300: 0.75, from300to600: 1.25, over600: 1.50 }
  }
};

interface MyFlightsProps {
  onPageChange?: (page: string, params?: any) => void;
  initialTab?: string;
  initialFilter?: string;
}

export function MyFlights({ onPageChange, initialTab = "upcoming", initialFilter }: MyFlightsProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [showEarnMilesDialog, setShowEarnMilesDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [completedFlightFilter, setCompletedFlightFilter] = useState<"all" | "not-sent" | "sent">(
    initialFilter === "not-requested" ? "not-sent" : "all"
  );
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicketFlight, setSelectedTicketFlight] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

  // Set tab to completed if filter is specified
  useEffect(() => {
    if (initialFilter === "not-requested") {
      setSelectedTab("past");
    }
  }, [initialFilter]);
  
  const { addRequest, requests } = useEarnMiles();

  // Sample flight data with 50+ completed flights
  const allFlights = [
    // Existing flights
    {
      id: "1",
      flightNumber: "VN204",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      departureDate: "2024-08-15",
      departureTime: "08:30",
      arrivalDate: "2024-08-15",
      arrivalTime: "10:45",
      duration: "2h 15m",
      aircraft: "Airbus A321",
      class: "Business",
      seatNumber: "3A",
      gate: "A12",
      terminal: "T1",
      status: "Confirmed",
      bookingReference: "VN2X4Y",
      eTicket: "2201234567890",
      miles: 1250,
      distance: 750,
      type: "upcoming"
    },
    {
      id: "2", 
      flightNumber: "VN548",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "NRT", city: "Tokyo", country: "Japan" },
      departureDate: "2024-08-20",
      departureTime: "14:20",
      arrivalDate: "2024-08-20",
      arrivalTime: "21:30",
      duration: "5h 10m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "28F",
      gate: "B6",
      terminal: "T1",
      status: "Ongoing",
      bookingReference: "VN8K9L",
      eTicket: "2201234567891",
      miles: 2850,
      distance: 2850,
      type: "ongoing"
    },
    {
      id: "3",
      flightNumber: "VN162",
      airline: "Vietnam Airlines", 
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "BKK", city: "Bangkok", country: "Thailand" },
      departureDate: "2024-07-25",
      departureTime: "16:45",
      arrivalDate: "2024-07-25",
      arrivalTime: "18:30",
      duration: "1h 45m",
      aircraft: "Airbus A320",
      class: "Economy",
      seatNumber: "15C",
      gate: "C3",
      terminal: "T2",
      status: "Completed",
      bookingReference: "VN3M5N",
      eTicket: "2201234567892",
      miles: 450,
      distance: 450,
      type: "past"
    },
    {
      id: "6",
      flightNumber: "VN123",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      departureDate: "2024-07-12",
      departureTime: "08:00",
      arrivalDate: "2024-07-12",
      arrivalTime: "10:15",
      duration: "2h 15m",
      aircraft: "Airbus A321",
      class: "Economy",
      seatNumber: "22A",
      gate: "A5",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN4G5H",
      eTicket: "2201234567895",
      miles: 675,
      distance: 675,
      type: "past"
    },
    {
      id: "7",
      flightNumber: "VN789",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "ICN", city: "Seoul", country: "South Korea" },
      departureDate: "2024-06-28",
      departureTime: "22:30",
      arrivalDate: "2024-06-29",
      arrivalTime: "05:45",
      duration: "3h 15m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "4B",
      gate: "B12",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN8J9K",
      eTicket: "2201234567896",
      miles: 2150,
      distance: 1720,
      type: "past"
    },
    {
      id: "4",
      flightNumber: "VN738",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "SIN", city: "Singapore", country: "Singapore" },
      departureDate: "2024-07-18",
      departureTime: "11:15",
      arrivalDate: "2024-07-18", 
      arrivalTime: "14:30",
      duration: "2h 15m",
      aircraft: "Airbus A321",
      class: "Business",
      seatNumber: "2D",
      gate: "A8",
      terminal: "T1",  
      status: "Completed",
      bookingReference: "VN7P8Q",
      eTicket: "2201234567893",
      miles: 1625,
      distance: 1300,
      type: "past"
    },
    {
      id: "5",
      flightNumber: "VN454",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "CDG", city: "Paris", country: "France" },
      departureDate: "2024-07-10",
      departureTime: "23:55",
      arrivalDate: "2024-07-11",
      arrivalTime: "07:20",
      duration: "12h 25m",
      aircraft: "Boeing 787",
      class: "Premium Economy", 
      seatNumber: "12A",
      gate: "B15",
      terminal: "T1",
      status: "Cancelled",
      bookingReference: "VN9R1S",
      eTicket: "2201234567894",
      miles: 0,
      distance: 8500,
      type: "cancelled"
    },
    // Adding 50 new completed flights
    {
      id: "8",
      flightNumber: "VN301",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
      departureDate: "2024-06-20",
      departureTime: "09:15",
      arrivalDate: "2024-06-20",
      arrivalTime: "12:30",
      duration: "2h 15m",
      aircraft: "Airbus A320",
      class: "Economy",
      seatNumber: "18B",
      gate: "B3",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1A2B",
      eTicket: "2201234567897",
      miles: 1580,
      distance: 1580,
      type: "past"
    },
    {
      id: "9",
      flightNumber: "VN412",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "PNH", city: "Phnom Penh", country: "Cambodia" },
      departureDate: "2024-06-15",
      departureTime: "14:30",
      arrivalDate: "2024-06-15",
      arrivalTime: "16:15",
      duration: "1h 45m",
      aircraft: "Airbus A321",
      class: "Premium Economy",
      seatNumber: "8C",
      gate: "A6",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3C4D",
      eTicket: "2201234567898",
      miles: 287,
      distance: 230,
      type: "past"
    },
    {
      id: "10",
      flightNumber: "VN523",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "RGN", city: "Yangon", country: "Myanmar" },
      departureDate: "2024-06-10",
      departureTime: "11:45",
      arrivalDate: "2024-06-10",
      arrivalTime: "13:30",
      duration: "1h 45m",
      aircraft: "Airbus A320",
      class: "Economy",
      seatNumber: "25F",
      gate: "C2",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5E6F",
      eTicket: "2201234567899",
      miles: 615,
      distance: 615,
      type: "past"
    },
    {
      id: "11",
      flightNumber: "VN634",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "VTE", city: "Vientiane", country: "Laos" },
      departureDate: "2024-06-05",
      departureTime: "07:20",
      arrivalDate: "2024-06-05",
      arrivalTime: "08:45",
      duration: "1h 25m",
      aircraft: "ATR 72",
      class: "Economy",
      seatNumber: "12A",
      gate: "D1",
      terminal: "T2",
      status: "Completed",
      bookingReference: "VN7G8H",
      eTicket: "2201234567900",
      miles: 450,
      distance: 450,
      type: "past"
    },
    {
      id: "12",
      flightNumber: "VN745",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "MNL", city: "Manila", country: "Philippines" },
      departureDate: "2024-05-30",
      departureTime: "15:10",
      arrivalDate: "2024-05-30",
      arrivalTime: "18:25",
      duration: "2h 15m",
      aircraft: "Airbus A321",
      class: "Business",
      seatNumber: "1F",
      gate: "A10",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9I0J",
      eTicket: "2201234567901",
      miles: 2645,
      distance: 1150,
      type: "past"
    },
    {
      id: "13",
      flightNumber: "VN856",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "JKT", city: "Jakarta", country: "Indonesia" },
      departureDate: "2024-05-25",
      departureTime: "13:35",
      arrivalDate: "2024-05-25",
      arrivalTime: "17:20",
      duration: "3h 45m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "32D",
      gate: "B8",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1K2L",
      eTicket: "2201234567902",
      miles: 1720,
      distance: 1720,
      type: "past"
    },
    {
      id: "14",
      flightNumber: "VN967",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "BKK", city: "Bangkok", country: "Thailand" },
      departureDate: "2024-05-20",
      departureTime: "18:40",
      arrivalDate: "2024-05-20",
      arrivalTime: "20:25",
      duration: "1h 45m",
      aircraft: "Airbus A320",
      class: "Premium Economy",
      seatNumber: "6B",
      gate: "C4",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3M4N",
      eTicket: "2201234567903",
      miles: 562,
      distance: 450,
      type: "past"
    },
    {
      id: "15",
      flightNumber: "VN078",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "SIN", city: "Singapore", country: "Singapore" },
      departureDate: "2024-05-15",
      departureTime: "06:50",
      arrivalDate: "2024-05-15",
      arrivalTime: "10:35",
      duration: "3h 45m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "5A",
      gate: "A14",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5O6P",
      eTicket: "2201234567904",
      miles: 2430,
      distance: 1620,
      type: "past"
    },
    {
      id: "16",
      flightNumber: "VN189",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "ICN", city: "Seoul", country: "South Korea" },
      departureDate: "2024-05-10",
      departureTime: "23:15",
      arrivalDate: "2024-05-11",
      arrivalTime: "06:30",
      duration: "3h 15m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "28C",
      gate: "B12",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7Q8R",
      eTicket: "2201234567905",
      miles: 2580,
      distance: 2580,
      type: "past"
    },
    {
      id: "17",
      flightNumber: "VN290",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "DAD", city: "Da Nang", country: "Vietnam" },
      departureDate: "2024-05-05",
      departureTime: "12:20",
      arrivalDate: "2024-05-05",
      arrivalTime: "13:45",
      duration: "1h 25m",
      aircraft: "Airbus A321",
      class: "Economy",
      seatNumber: "20E",
      gate: "A3",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9S0T",
      eTicket: "2201234567906",
      miles: 608,
      distance: 608,
      type: "past"
    },
    {
      id: "18",
      flightNumber: "VN401",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "NRT", city: "Tokyo", country: "Japan" },
      departureDate: "2024-04-30",
      departureTime: "01:25",
      arrivalDate: "2024-04-30",
      arrivalTime: "08:35",
      duration: "5h 10m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "2B",
      gate: "B6",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1U2V",
      eTicket: "2201234567907",
      miles: 4275,
      distance: 2850,
      type: "past"
    },
    {
      id: "19",
      flightNumber: "VN512",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "BOM", city: "Mumbai", country: "India" },
      departureDate: "2024-04-25",
      departureTime: "16:40",
      arrivalDate: "2024-04-25",
      arrivalTime: "20:15",
      duration: "4h 35m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "10C",
      gate: "B10",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3W4X",
      eTicket: "2201234567908",
      miles: 3375,
      distance: 2700,
      type: "past"
    },
    {
      id: "20",
      flightNumber: "VN623",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "SYD", city: "Sydney", country: "Australia" },
      departureDate: "2024-04-20",
      departureTime: "22:50",
      arrivalDate: "2024-04-21",
      arrivalTime: "09:15",
      duration: "8h 25m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "1A",
      gate: "A16",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5Y6Z",
      eTicket: "2201234567909",
      miles: 11370,
      distance: 7580,
      type: "past"
    },
    {
      id: "21",
      flightNumber: "VN734",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "FRA", city: "Frankfurt", country: "Germany" },
      departureDate: "2024-04-15",
      departureTime: "00:45",
      arrivalDate: "2024-04-15",
      arrivalTime: "07:30",
      duration: "12h 45m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "14F",
      gate: "B14",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7A8B",
      eTicket: "2201234567910",
      miles: 11025,
      distance: 8820,
      type: "past"
    },
    {
      id: "22",
      flightNumber: "VN845",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "TPE", city: "Taipei", country: "Taiwan" },
      departureDate: "2024-04-10",
      departureTime: "19:30",
      arrivalDate: "2024-04-10",
      arrivalTime: "23:45",
      duration: "2h 15m",
      aircraft: "Airbus A321",
      class: "Economy",
      seatNumber: "26A",
      gate: "C6",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9C0D",
      eTicket: "2201234567911",
      miles: 1320,
      distance: 1320,
      type: "past"
    },
    {
      id: "23",
      flightNumber: "VN956",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "KMG", city: "Kunming", country: "China" },
      departureDate: "2024-04-05",
      departureTime: "08:15",
      arrivalDate: "2024-04-05",
      arrivalTime: "10:30",
      duration: "1h 15m",
      aircraft: "Airbus A320",
      class: "Business",
      seatNumber: "3C",
      gate: "A8",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1E2F",
      eTicket: "2201234567912",
      miles: 563,
      distance: 375,
      type: "past"
    },
    {
      id: "24",
      flightNumber: "VN067",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "CAN", city: "Guangzhou", country: "China" },
      departureDate: "2024-03-30",
      departureTime: "14:55",
      arrivalDate: "2024-03-30",
      arrivalTime: "18:10",
      duration: "2h 15m",
      aircraft: "Airbus A321",
      class: "Economy",
      seatNumber: "19D",
      gate: "B4",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3G4H",
      eTicket: "2201234567913",
      miles: 1050,
      distance: 1050,
      type: "past"
    },
    {
      id: "25",
      flightNumber: "VN178",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "NKG", city: "Nanjing", country: "China" },
      departureDate: "2024-03-25",
      departureTime: "20:40",
      arrivalDate: "2024-03-26",
      arrivalTime: "00:25",
      duration: "2h 45m",
      aircraft: "Airbus A321",
      class: "Premium Economy",
      seatNumber: "9B",
      gate: "C8",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5I6J",
      eTicket: "2201234567914",
      miles: 1969,
      distance: 1575,
      type: "past"
    },
    {
      id: "26",
      flightNumber: "VN289",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "BJS", city: "Beijing", country: "China" },
      departureDate: "2024-03-20",
      departureTime: "11:20",
      arrivalDate: "2024-03-20",
      arrivalTime: "16:45",
      duration: "4h 25m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "4D",
      gate: "A12",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7K8L",
      eTicket: "2201234567915",
      miles: 3825,
      distance: 2550,
      type: "past"
    },
    {
      id: "27",
      flightNumber: "VN390",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "SHA", city: "Shanghai", country: "China" },
      departureDate: "2024-03-15",
      departureTime: "17:10",
      arrivalDate: "2024-03-15",
      arrivalTime: "21:35",
      duration: "3h 25m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "31F",
      gate: "B11",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9M0N",
      eTicket: "2201234567916",
      miles: 1940,
      distance: 1940,
      type: "past"
    },
    {
      id: "28",
      flightNumber: "VN501",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "HKG", city: "Hong Kong", country: "Hong Kong" },
      departureDate: "2024-03-10",
      departureTime: "09:45",
      arrivalDate: "2024-03-10",
      arrivalTime: "13:20",
      duration: "2h 35m",
      aircraft: "Airbus A321",
      class: "Business",
      seatNumber: "2A",
      gate: "A6",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1O2P",
      eTicket: "2201234567917",
      miles: 2175,
      distance: 1450,
      type: "past"
    },
    {
      id: "29",
      flightNumber: "VN612",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "PUS", city: "Busan", country: "South Korea" },
      departureDate: "2024-03-05",
      departureTime: "13:30",
      arrivalDate: "2024-03-05",
      arrivalTime: "18:15",
      duration: "2h 45m",
      aircraft: "Airbus A321",
      class: "Economy",
      seatNumber: "24B",
      gate: "C3",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3Q4R",
      eTicket: "2201234567918",
      miles: 1980,
      distance: 1980,
      type: "past"
    },
    {
      id: "30",
      flightNumber: "VN723",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "OSA", city: "Osaka", country: "Japan" },
      departureDate: "2024-02-28",
      departureTime: "00:15",
      arrivalDate: "2024-02-28",
      arrivalTime: "07:30",
      duration: "5h 15m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "11A",
      gate: "B8",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5S6T",
      eTicket: "2201234567919",
      miles: 3375,
      distance: 2700,
      type: "past"
    },
    {
      id: "31",
      flightNumber: "VN834",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "MEL", city: "Melbourne", country: "Australia" },
      departureDate: "2024-02-25",
      departureTime: "23:40",
      arrivalDate: "2024-02-26",
      arrivalTime: "13:55",
      duration: "9h 15m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "6B",
      gate: "A18",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7U8V",
      eTicket: "2201234567920",
      miles: 12075,
      distance: 8050,
      type: "past"
    },
    {
      id: "32",
      flightNumber: "VN945",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "LHR", city: "London", country: "United Kingdom" },
      departureDate: "2024-02-20",
      departureTime: "01:20",
      arrivalDate: "2024-02-20",
      arrivalTime: "08:45",
      duration: "13h 25m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "1D",
      gate: "B16",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9W0X",
      eTicket: "2201234567921",
      miles: 16650,
      distance: 11100,
      type: "past"
    },
    {
      id: "33",
      flightNumber: "VN056",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "LAX", city: "Los Angeles", country: "United States" },
      departureDate: "2024-02-15",
      departureTime: "14:30",
      arrivalDate: "2024-02-15",
      arrivalTime: "12:45",
      duration: "15h 15m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "13C",
      gate: "A20",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1Y2Z",
      eTicket: "2201234567922",
      miles: 20250,
      distance: 16200,
      type: "past"
    },
    {
      id: "34",
      flightNumber: "VN167",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "JFK", city: "New York", country: "United States" },
      departureDate: "2024-02-10",
      departureTime: "02:15",
      arrivalDate: "2024-02-10",
      arrivalTime: "05:30",
      duration: "18h 15m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "3B",
      gate: "B18",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3A4B",
      eTicket: "2201234567923",
      miles: 25875,
      distance: 17250,
      type: "past"
    },
    {
      id: "35",
      flightNumber: "VN278",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "YVR", city: "Vancouver", country: "Canada" },
      departureDate: "2024-02-05",
      departureTime: "15:45",
      arrivalDate: "2024-02-05",
      arrivalTime: "11:20",
      duration: "14h 35m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "35E",
      gate: "C12",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5C6D",
      eTicket: "2201234567924",
      miles: 12600,
      distance: 12600,
      type: "past"
    },
    {
      id: "36",
      flightNumber: "VN389",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "DXB", city: "Dubai", country: "UAE" },
      departureDate: "2024-01-30",
      departureTime: "20:10",
      arrivalDate: "2024-01-31",
      arrivalTime: "01:25",
      duration: "9h 15m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "2C",
      gate: "A14",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7E8F",
      eTicket: "2201234567925",
      miles: 9450,
      distance: 6300,
      type: "past"
    },
    {
      id: "37",
      flightNumber: "VN490",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "DOH", city: "Doha", country: "Qatar" },
      departureDate: "2024-01-25",
      departureTime: "03:40",
      arrivalDate: "2024-01-25",
      arrivalTime: "08:15",
      duration: "8h 35m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "15D",
      gate: "B12",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9G0H",
      eTicket: "2201234567926",
      miles: 7875,
      distance: 6300,
      type: "past"
    },
    {
      id: "38",
      flightNumber: "VN601",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "IST", city: "Istanbul", country: "Turkey" },
      departureDate: "2024-01-20",
      departureTime: "12:25",
      arrivalDate: "2024-01-20",
      arrivalTime: "19:50",
      duration: "11h 25m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "29A",
      gate: "C10",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1I2J",
      eTicket: "2201234567927",
      miles: 8400,
      distance: 8400,
      type: "past"
    },
    {
      id: "39",
      flightNumber: "VN712",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "ZUR", city: "Zurich", country: "Switzerland" },
      departureDate: "2024-01-15",
      departureTime: "00:50",
      arrivalDate: "2024-01-15",
      arrivalTime: "08:35",
      duration: "13h 45m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "4A",
      gate: "A16",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3K4L",
      eTicket: "2201234567928",
      miles: 14175,
      distance: 9450,
      type: "past"
    },
    {
      id: "40",
      flightNumber: "VN823",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "CDG", city: "Paris", country: "France" },
      departureDate: "2024-01-10",
      departureTime: "21:35",
      arrivalDate: "2024-01-11",
      arrivalTime: "06:20",
      duration: "14h 45m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "12B",
      gate: "B14",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5M6N",
      eTicket: "2201234567929",
      miles: 13125,
      distance: 10500,
      type: "past"
    },
    {
      id: "41",
      flightNumber: "VN934",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "FCO", city: "Rome", country: "Italy" },
      departureDate: "2024-01-05",
      departureTime: "16:15",
      arrivalDate: "2024-01-06",
      arrivalTime: "00:45",
      duration: "14h 30m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "33C",
      gate: "C14",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7O8P",
      eTicket: "2201234567930",
      miles: 9720,
      distance: 9720,
      type: "past"
    },
    {
      id: "42",
      flightNumber: "VN045",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "AMS", city: "Amsterdam", country: "Netherlands" },
      departureDate: "2023-12-30",
      departureTime: "22:40",
      arrivalDate: "2023-12-31",
      arrivalTime: "07:15",
      duration: "14h 35m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "1C",
      gate: "A18",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9Q0R",
      eTicket: "2201234567931",
      miles: 15750,
      distance: 10500,
      type: "past"
    },
    {
      id: "43",
      flightNumber: "VN156",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "ARN", city: "Stockholm", country: "Sweden" },
      departureDate: "2023-12-25",
      departureTime: "13:20",
      arrivalDate: "2023-12-25",
      arrivalTime: "21:45",
      duration: "14h 25m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "16A",
      gate: "B16",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1S2T",
      eTicket: "2201234567932",
      miles: 11250,
      distance: 9000,
      type: "past"
    },
    {
      id: "44",
      flightNumber: "VN267",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "CPH", city: "Copenhagen", country: "Denmark" },
      departureDate: "2023-12-20",
      departureTime: "04:35",
      arrivalDate: "2023-12-20",
      arrivalTime: "13:50",
      duration: "15h 15m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "27D",
      gate: "C16",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3U4V",
      eTicket: "2201234567933",
      miles: 9450,
      distance: 9450,
      type: "past"
    },
    {
      id: "45",
      flightNumber: "VN378",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "HEL", city: "Helsinki", country: "Finland" },
      departureDate: "2023-12-15",
      departureTime: "19:50",
      arrivalDate: "2023-12-16",
      arrivalTime: "03:25",
      duration: "13h 35m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "5D",
      gate: "A20",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5W6X",
      eTicket: "2201234567934",
      miles: 11475,
      distance: 7650,
      type: "past"
    },
    {
      id: "46",
      flightNumber: "VN489",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "OSL", city: "Oslo", country: "Norway" },
      departureDate: "2023-12-10",
      departureTime: "08:15",
      arrivalDate: "2023-12-10",
      arrivalTime: "16:40",
      duration: "14h 25m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "17B",
      gate: "B18",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7Y8Z",
      eTicket: "2201234567935",
      miles: 11813,
      distance: 9450,
      type: "past"
    },
    {
      id: "47",
      flightNumber: "VN590",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "WAW", city: "Warsaw", country: "Poland" },
      departureDate: "2023-12-05",
      departureTime: "14:45",
      arrivalDate: "2023-12-05",
      arrivalTime: "23:20",
      duration: "12h 35m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "30F",
      gate: "C18",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9A0B",
      eTicket: "2201234567936",
      miles: 8100,
      distance: 8100,
      type: "past"
    },
    {
      id: "48",
      flightNumber: "VN601",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "PRG", city: "Prague", country: "Czech Republic" },
      departureDate: "2023-11-30",
      departureTime: "11:30",
      arrivalDate: "2023-11-30",
      arrivalTime: "20:15",
      duration: "13h 45m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "2D",
      gate: "A22",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1C2D",
      eTicket: "2201234567937",
      miles: 13725,
      distance: 9150,
      type: "past"
    },
    {
      id: "49",
      flightNumber: "VN712",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "VIE", city: "Vienna", country: "Austria" },
      departureDate: "2023-11-25",
      departureTime: "17:20",
      arrivalDate: "2023-11-26",
      arrivalTime: "01:55",
      duration: "12h 35m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "18C",
      gate: "B20",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3E4F",
      eTicket: "2201234567938",
      miles: 10125,
      distance: 8100,
      type: "past"
    },
    {
      id: "50",
      flightNumber: "VN823",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "MUC", city: "Munich", country: "Germany" },
      departureDate: "2023-11-20",
      departureTime: "23:45",
      arrivalDate: "2023-11-21",
      arrivalTime: "08:30",
      duration: "14h 45m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "32A",
      gate: "C20",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5G6H",
      eTicket: "2201234567939",
      miles: 9900,
      distance: 9900,
      type: "past"
    },
    {
      id: "51",
      flightNumber: "VN934",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "BCN", city: "Barcelona", country: "Spain" },
      departureDate: "2023-11-15",
      departureTime: "06:10",
      arrivalDate: "2023-11-15",
      arrivalTime: "15:35",
      duration: "15h 25m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "6A",
      gate: "A24",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7I8J",
      eTicket: "2201234567940",
      miles: 17100,
      distance: 11400,
      type: "past"
    },
    {
      id: "52",
      flightNumber: "VN045",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "MAD", city: "Madrid", country: "Spain" },
      departureDate: "2023-11-10",
      departureTime: "12:55",
      arrivalDate: "2023-11-10",
      arrivalTime: "22:40",
      duration: "15h 45m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "19D",
      gate: "B22",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9K0L",
      eTicket: "2201234567941",
      miles: 16875,
      distance: 13500,
      type: "past"
    },
    {
      id: "53",
      flightNumber: "VN156",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "LIS", city: "Lisbon", country: "Portugal" },
      departureDate: "2023-11-05",
      departureTime: "20:25",
      arrivalDate: "2023-11-06",
      arrivalTime: "05:50",
      duration: "15h 25m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "34B",
      gate: "C22",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN1M2N",
      eTicket: "2201234567942",
      miles: 12150,
      distance: 12150,
      type: "past"
    },
    {
      id: "54",
      flightNumber: "VN267",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "ATH", city: "Athens", country: "Greece" },
      departureDate: "2023-10-30",
      departureTime: "15:40",
      arrivalDate: "2023-10-31",
      arrivalTime: "01:15",
      duration: "13h 35m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "3A",
      gate: "A26",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN3O4P",
      eTicket: "2201234567943",
      miles: 13275,
      distance: 8850,
      type: "past"
    },
    {
      id: "55",
      flightNumber: "VN378",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "BUD", city: "Budapest", country: "Hungary" },
      departureDate: "2023-10-25",
      departureTime: "09:30",
      arrivalDate: "2023-10-25",
      arrivalTime: "18:05",
      duration: "12h 35m",
      aircraft: "Boeing 787",
      class: "Premium Economy",
      seatNumber: "20F",
      gate: "B24",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN5Q6R",
      eTicket: "2201234567944",
      miles: 10125,
      distance: 8100,
      type: "past"
    },
    {
      id: "56",
      flightNumber: "VN489",
      airline: "Vietnam Airlines",
      from: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
      to: { code: "BRU", city: "Brussels", country: "Belgium" },
      departureDate: "2023-10-20",
      departureTime: "01:15",
      arrivalDate: "2023-10-20",
      arrivalTime: "10:40",
      duration: "15h 25m",
      aircraft: "Boeing 787",
      class: "Economy",
      seatNumber: "28E",
      gate: "C24",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN7S8T",
      eTicket: "2201234567945",
      miles: 10500,
      distance: 10500,
      type: "past"
    },
    {
      id: "57",
      flightNumber: "VN590",
      airline: "Vietnam Airlines",
      from: { code: "HAN", city: "Hanoi", country: "Vietnam" },
      to: { code: "MXP", city: "Milan", country: "Italy" },
      departureDate: "2023-10-15",
      departureTime: "18:50",
      arrivalDate: "2023-10-16",
      arrivalTime: "03:25",
      duration: "14h 35m",
      aircraft: "Boeing 787",
      class: "Business",
      seatNumber: "4C",
      gate: "A28",
      terminal: "T1",
      status: "Completed",
      bookingReference: "VN9U0V",
      eTicket: "2201234567946",
      miles: 14175,
      distance: 9450,
      type: "past"
    }
  ];

  // Filter flights by date range
  const filterFlightsByDate = (flights: any[]) => {
    if (!dateFilter.from && !dateFilter.to) return flights;
    
    return flights.filter(flight => {
      const flightDate = new Date(flight.departureDate);
      const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
      
      if (fromDate && toDate) {
        return flightDate >= fromDate && flightDate <= toDate;
      } else if (fromDate) {
        return flightDate >= fromDate;
      } else if (toDate) {
        return flightDate <= toDate;
      }
      
      return true;
    });
  };

  // Separate flights by type
  const upcomingFlights = filterFlightsByDate(allFlights.filter(flight => flight.type === "upcoming"));
  const ongoingFlights = filterFlightsByDate(allFlights.filter(flight => flight.type === "ongoing"));
  const pastFlights = filterFlightsByDate(allFlights.filter(flight => flight.type === "past"));
  const cancelledFlights = filterFlightsByDate(allFlights.filter(flight => flight.type === "cancelled"));

  // Filter completed flights based on filter selection
  const getFilteredCompletedFlights = () => {
    switch (completedFlightFilter) {
      case "not-sent":
        return pastFlights.filter(flight => !requests.some(req => req.flightNumber === flight.flightNumber));
      case "sent":
        return pastFlights.filter(flight => requests.some(req => req.flightNumber === flight.flightNumber));
      default:
        return pastFlights;
    }
  };

  // Earn Miles Form State
  const [earnMilesForm, setEarnMilesForm] = useState({
    flightNumber: "",
    airline: "",
    from: "",
    to: "",
    departureDate: "",
    serviceClass: "",
    seatClass: "",
    distance: "",
    calculatedMiles: 0,
    calculationDetails: {
      baseMiles: 0,
      multiplier: 0,
      distanceCategory: ""
    }
  });

  const getSeatClassOptions = (serviceClass: string) => {
    switch (serviceClass) {
      case "Business":
        return ["J", "C", "D", "I", "O"];
      case "Premium Economy":
        return ["W", "E"];
      case "Economy":
        return ["Y", "B", "M", "H", "Q", "V", "W", "S", "T", "L", "K", "G", "N"];
      default:
        return [];
    }
  };

  const calculateMiles = () => {
    const { serviceClass, seatClass, distance } = earnMilesForm;
    
    if (!serviceClass || !seatClass || !distance) {
      toast.error("Please fill in all required fields");
      return;
    }

    const distanceNum = parseInt(distance);
    const serviceStructure = VN_MILES_STRUCTURE[serviceClass as keyof typeof VN_MILES_STRUCTURE];
    const seatStructure = serviceStructure[seatClass as keyof typeof serviceStructure];
    
    let multiplier = 0;
    let distanceCategory = "";
    
    if (distanceNum < 300) {
      multiplier = seatStructure.under300;
      distanceCategory = "Under 300 miles";
    } else if (distanceNum >= 300 && distanceNum < 600) {
      multiplier = seatStructure.from300to600;
      distanceCategory = "300-600 miles";
    } else {
      multiplier = seatStructure.over600;
      distanceCategory = "600+ miles";
    }

    const calculatedMiles = Math.round(distanceNum * multiplier);

    setEarnMilesForm(prev => ({
      ...prev,
      calculatedMiles,
      calculationDetails: {
        baseMiles: distanceNum,
        multiplier,
        distanceCategory
      }
    }));

    toast.success(`Calculated ${calculatedMiles.toLocaleString()} miles!`);
  };

  const handleEarnMilesClick = (flight: any) => {
    setSelectedFlight(flight);
    setEarnMilesForm({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      from: `${flight.from.code} - ${flight.from.city}`,
      to: `${flight.to.code} - ${flight.to.city}`,
      departureDate: flight.departureDate,
      serviceClass: flight.class === "Business" ? "Business" : flight.class === "Premium Economy" ? "Premium Economy" : "Economy",
      seatClass: "",
      distance: flight.distance.toString(),
      calculatedMiles: 0,
      calculationDetails: {
        baseMiles: 0,
        multiplier: 0,
        distanceCategory: ""
      }
    });
    setShowEarnMilesDialog(true);
  };

  const handleSubmitEarnMiles = () => {
    if (!earnMilesForm.calculatedMiles) {
      toast.error("Please calculate miles first");
      return;
    }

    const newRequest = {
      id: `REQ${Date.now()}`,
      flightNumber: earnMilesForm.flightNumber,
      airline: earnMilesForm.airline,
      from: earnMilesForm.from,
      to: earnMilesForm.to,
      departureDate: earnMilesForm.departureDate,
      serviceClass: earnMilesForm.serviceClass,
      seatClass: earnMilesForm.seatClass,
      distance: parseInt(earnMilesForm.distance),
      calculatedMiles: earnMilesForm.calculatedMiles,
      submittedDate: new Date().toISOString().split('T')[0],
      status: "waiting to confirm" as const
    };

    addRequest(newRequest);
    
    toast.success(`Miles request submitted successfully! Request ID: ${newRequest.id}`);
    setShowEarnMilesDialog(false);
    handleCancelEarnMiles();
  };

  const handleCancelEarnMiles = () => {
    setSelectedFlight(null);
    setEarnMilesForm({
      flightNumber: "",
      airline: "",
      from: "",
      to: "",
      departureDate: "",
      serviceClass: "",
      seatClass: "",
      distance: "",
      calculatedMiles: 0,
      calculationDetails: {
        baseMiles: 0,
        multiplier: 0,
        distanceCategory: ""
      }
    });
  };

  const handleDownloadTicket = (flight: any) => {
    setSelectedTicketFlight(flight);
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setSelectedTicketFlight(null);
  };

  const handleDownloadTicketFile = () => {
    // Create a simple ticket content for download
    const ticketContent = `
VIETNAM AIRLINES E-TICKET
=========================

Flight: ${selectedTicketFlight?.flightNumber}
From: ${selectedTicketFlight?.from.code} - ${selectedTicketFlight?.from.city}
To: ${selectedTicketFlight?.to.code} - ${selectedTicketFlight?.to.city}
Date: ${selectedTicketFlight?.departureDate}
Time: ${selectedTicketFlight?.departureTime}
Seat: ${selectedTicketFlight?.seatNumber}
Class: ${selectedTicketFlight?.class}
Booking Reference: ${selectedTicketFlight?.bookingReference}
E-Ticket: ${selectedTicketFlight?.eTicket}

Thank you for choosing Vietnam Airlines!
    `;
    
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VN-Ticket-${selectedTicketFlight?.flightNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Ticket downloaded successfully!");
  };

  const getFlightStatus = (flight: any) => {
    switch (flight.status) {
      case "Confirmed":
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>;
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case "Ongoing":
        return <Badge className="bg-purple-100 text-purple-700">Ongoing</Badge>;
      case "Completed":
        return <Badge className="bg-gray-100 text-gray-700">Completed</Badge>;
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{flight.status}</Badge>;
    }
  };

  const getEarnMilesButtonState = (flight: any) => {
    const request = requests.find(req => req.flightNumber === flight.flightNumber);
    if (!request) {
      return {
        text: "Request Earn Miles Now",
        variant: "default" as const,
        disabled: false,
        icon: <Send className="h-4 w-4 mr-2" />
      };
    }

    switch (request.status) {
      case 'waiting to confirm':
        return {
          text: "Sent Request - Reviewing Request",
          variant: "outline" as const,
          disabled: true,
          icon: <HourglassIcon className="h-4 w-4 mr-2" />
        };
      case 'approved':
        return {
          text: "Miles Credited",
          variant: "outline" as const,
          disabled: true,
          icon: <CheckCircle className="h-4 w-4 mr-2" />
        };
      case 'rejected':
        return {
          text: "Request Rejected",
          variant: "outline" as const,
          disabled: true,
          icon: <X className="h-4 w-4 mr-2" />
        };
      default:
        return {
          text: "Request Earn Miles Now",
          variant: "default" as const,
          disabled: false,
          icon: <Send className="h-4 w-4 mr-2" />
        };
    }
  };

  const FlightCard = ({ flight, showActions = false }: { flight: any; showActions?: boolean }) => {
    const request = requests.find(req => req.flightNumber === flight.flightNumber);
    const buttonState = getEarnMilesButtonState(flight);
    
    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{flight.flightNumber}</h3>
                <p className="text-gray-600">{flight.airline}</p>
              </div>
            </div>
            <div className="text-right">
              {getFlightStatus(flight)}
              <p className="text-sm text-gray-500 mt-1">{flight.bookingReference}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{flight.from.code}</p>
                <p className="text-sm text-gray-600">{flight.from.city}</p>
                <p className="text-sm font-medium">{flight.departureTime}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-600">{flight.duration}</p>
                <div className="w-24 h-px bg-gray-300 mx-auto mt-2"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 justify-end">
              <div className="text-right">
                <p className="font-medium">{flight.to.code}</p>
                <p className="text-sm text-gray-600">{flight.to.city}</p>
                <p className="text-sm font-medium">{flight.arrivalTime}</p>
              </div>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(flight.departureDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{flight.class} - {flight.seatNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="h-4 w-4" />
              <span>{flight.aircraft}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>{flight.miles.toLocaleString()} miles</span>
            </div>
          </div>

          {flight.type === "past" && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {request?.status === 'waiting to confirm' && `Your request for ${request.calculatedMiles.toLocaleString()} miles is under review.`}
                  {request?.status === 'approved' && `${request.calculatedMiles.toLocaleString()} miles have been credited to your account.`}
                  {request?.status === 'rejected' && `Your miles request was rejected. ${request.reason || ''}`}
                  {!request && "You can request miles for this completed flight."}
                </div>
                <Button
                  onClick={() => handleEarnMilesClick(flight)}
                  variant={buttonState.variant}
                  disabled={buttonState.disabled}
                  className={`${request?.status === 'waiting to confirm' ? 'bg-orange-600 hover:bg-orange-700' : request?.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : !request ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                >
                  {buttonState.icon}
                  {buttonState.text}
                </Button>
              </div>
            </div>
          )}

          {showActions && flight.type === "upcoming" && (
            <div className="border-t pt-4 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadTicket(flight)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter by Flight Date</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="date-from">From:</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="date-to">To:</Label>
              <Input
                id="date-to"
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                className="w-40"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setDateFilter({ from: "", to: "" })}
            >
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab("upcoming")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {upcomingFlights.length}
            </div>
            <p className="text-sm text-gray-600">Upcoming Flights</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab("ongoing")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {ongoingFlights.length}
            </div>
            <p className="text-sm text-gray-600">Ongoing Flights</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab("past")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {pastFlights.length}
            </div>
            <p className="text-sm text-gray-600">Completed Flights</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab("cancelled")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {cancelledFlights.length}
            </div>
            <p className="text-sm text-gray-600">Cancelled Flights</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(upcomingFlights.length + ongoingFlights.length + pastFlights.length + cancelledFlights.length)}
            </div>
            <p className="text-sm text-gray-600">Total Flights</p>
          </CardContent>
        </Card>
      </div>

      {/* Flights Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming Flights</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing Flights</TabsTrigger>
          <TabsTrigger value="past">Completed Flights</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled Flights</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingFlights.length > 0 ? (
            upcomingFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} showActions={true} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming flights</h3>
                <p className="text-gray-500 mb-4">You don't have any upcoming flights booked.</p>
                <Button>Book a Flight</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          {ongoingFlights.length > 0 ? (
            ongoingFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} showActions={true} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing flights</h3>
                <p className="text-gray-500">You don't have any flights currently in progress.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {/* Filter for completed flights */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="completed-filter">Filter completed flights:</Label>
                <Select 
                  value={completedFlightFilter} 
                  onValueChange={(value: "all" | "not-sent" | "sent") => setCompletedFlightFilter(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Completed Flights</SelectItem>
                    <SelectItem value="not-sent">Miles Not Requested</SelectItem>
                    <SelectItem value="sent">Miles Requested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {getFilteredCompletedFlights().length > 0 ? (
            getFilteredCompletedFlights().map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed flights</h3>
                <p className="text-gray-500">No completed flights match your current filter.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledFlights.length > 0 ? (
            cancelledFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled flights</h3>
                <p className="text-gray-500">You don't have any cancelled flights.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Earn Miles Dialog */}
      <Dialog open={showEarnMilesDialog} onOpenChange={setShowEarnMilesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Request Earn Miles</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flight-number">Flight Number</Label>
                <Input
                  id="flight-number"
                  value={earnMilesForm.flightNumber}
                  onChange={(e) => setEarnMilesForm(prev => ({ ...prev, flightNumber: e.target.value }))}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="airline">Airline</Label>
                <Input
                  id="airline"
                  value={earnMilesForm.airline}
                  onChange={(e) => setEarnMilesForm(prev => ({ ...prev, airline: e.target.value }))}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  value={earnMilesForm.from}
                  onChange={(e) => setEarnMilesForm(prev => ({ ...prev, from: e.target.value }))}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={earnMilesForm.to}
                  onChange={(e) => setEarnMilesForm(prev => ({ ...prev, to: e.target.value }))}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departure-date">Departure Date</Label>
                <Input
                  id="departure-date"
                  type="date"
                  value={earnMilesForm.departureDate}
                  onChange={(e) => setEarnMilesForm(prev => ({ ...prev, departureDate: e.target.value }))}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="distance">Distance (miles)</Label>
                <Input
                  id="distance"
                  value={earnMilesForm.distance}
                  onChange={(e) => setEarnMilesForm(prev => ({ ...prev, distance: e.target.value }))}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-class">Service Class</Label>
                <Select 
                  value={earnMilesForm.serviceClass} 
                  onValueChange={(value) => setEarnMilesForm(prev => ({ ...prev, serviceClass: value, seatClass: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Economy">Economy</SelectItem>
                    <SelectItem value="Premium Economy">Premium Economy</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="seat-class">Seat Class</Label>
                <Select 
                  value={earnMilesForm.seatClass} 
                  onValueChange={(value) => setEarnMilesForm(prev => ({ ...prev, seatClass: value }))}
                  disabled={!earnMilesForm.serviceClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select seat class" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSeatClassOptions(earnMilesForm.serviceClass).map(seatClass => (
                      <SelectItem key={seatClass} value={seatClass}>{seatClass}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={calculateMiles} variant="outline" className="flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Calculate Miles</span>
              </Button>
              {earnMilesForm.calculatedMiles > 0 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{earnMilesForm.calculatedMiles.toLocaleString()} miles calculated</span>
                </div>
              )}
            </div>

            {earnMilesForm.calculatedMiles > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Calculation Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Base Distance: {earnMilesForm.calculationDetails.baseMiles.toLocaleString()} miles</p>
                  <p>Distance Category: {earnMilesForm.calculationDetails.distanceCategory}</p>
                  <p>Multiplier: {earnMilesForm.calculationDetails.multiplier}x</p>
                  <p className="font-medium text-green-600">
                    Total Miles: {earnMilesForm.calculatedMiles.toLocaleString()} miles
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEarnMilesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEarnMiles} disabled={!earnMilesForm.calculatedMiles}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Modal */}
      <Dialog open={showTicketModal} onOpenChange={handleCloseTicketModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>E-Ticket</DialogTitle>
          </DialogHeader>
          
          {selectedTicketFlight && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold text-lg">{selectedTicketFlight.airline}</h3>
                <p className="text-gray-600">Electronic Ticket</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Flight:</span>
                  <span className="font-medium">{selectedTicketFlight.flightNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{selectedTicketFlight.from.code} - {selectedTicketFlight.from.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{selectedTicketFlight.to.code} - {selectedTicketFlight.to.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(selectedTicketFlight.departureDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTicketFlight.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat:</span>
                  <span className="font-medium">{selectedTicketFlight.seatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{selectedTicketFlight.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Ref:</span>
                  <span className="font-medium">{selectedTicketFlight.bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-Ticket:</span>
                  <span className="font-medium">{selectedTicketFlight.eTicket}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseTicketModal}>
              Close
            </Button>
            <Button onClick={handleDownloadTicketFile}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}