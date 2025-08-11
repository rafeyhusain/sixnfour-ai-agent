// "use client"

// import { useEffect, useState } from "react";

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Posts } from "@/components/posts/posts";
// import { SpinnerStrip } from "@/components/wingui/spinner-strip/spinner-strip";
// import { DashboardService } from "@/sdk/services/dashboard-service";
// import { Campaign } from "@/sdk/contracts";
// import { Toolbar, Action } from "@/components/wingui/toolbar/toolbar";
// import { CampaignEditor } from "@/components/campaign/campaign-editor";
// import { CalendarEvent } from '@/components/wingui/wing-calendar/calendar/calendar-types';

// export default function PostsPage() {
//   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
//   const [selectedCampaign, setSelectedCampaign] = useState<Campaign>({} as Campaign);
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<string>("");
//   const [date, setDate] = useState<Date | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [eventsLoading, setEventsLoading] = useState(false);
//   const [editorCampaignId, setEditorCampaignId] = useState<string | undefined>(undefined);
//   const [showEditor, setShowEditor] = useState(false);


//   const setEditor = (campaignId: string | undefined) => {
//     setShowEditor(true);
//     setEditorCampaignId(campaignId);
//   };

//   const resetEditor = () => {
//     setShowEditor(false);
//     setEditorCampaignId(undefined);
//   };

//   const handleCampaignSaved = async (campaign: Campaign) => {
//     // Refresh campaigns list
//     const updatedCampaigns = await DashboardService.getCampaigns();
//     setCampaigns(updatedCampaigns);

//     // Update selected campaign if it was the one being edited
//     if (selectedCampaign.id === campaign.id) {
//       const updatedCampaign = updatedCampaigns.find(c => c.id === campaign.id);
//       if (updatedCampaign) {
//         setSelectedCampaign(updatedCampaign);
//       }
//     }

//     // Refresh events
//     const updatedEvents = await DashboardService.getEvents(new Date());
//     setEvents(updatedEvents);

//     // Update selected event if needed
//     if (updatedEvents.length > 0) {
//       setSelectedEvent(updatedEvents[0]);
//       setDate(new Date(updatedEvents[0].start));
//     }

//     resetEditor();
//   };

//   // Define actions for the toolbar
//   const actions: Action[] = [
//     {
//       label: "Actions",
//       onClick: () => { },
//       actions: [
//         {
//           label: "Edit Campaign",
//           onClick: () => { setEditor(selectedCampaign.id); },
//           variant: "default",
//         },
//         {
//           label: "New Campaign",
//           onClick: () => { setEditor(undefined); }
//         },
//         {
//           label: "Generate All",
//           onClick: () => alert("Generate All clicked")
//         },
//         {
//           label: "Publish All",
//           onClick: () => alert("Publish All clicked")
//         },
//       ]
//     }
//   ];

//   useEffect(() => {
//     setLoading(true);
//     DashboardService.getCampaigns().then((data) => {
//       setCampaigns(data);
//       if (data[0]) {
//         setSelectedCampaign(data[0]);
//       }
//       setLoading(false);
//     });
//   }, []);

//   useEffect(() => {
//     if (!selectedCampaign.id) return;
//     setEventsLoading(true);
//     new DashboardService().getEvents(selectedCampaign.id).then((eventDates) => {
//       setEvents(eventDates);
//       if (eventDates.length > 0) {
//         setSelectedEvent(eventDates[0]);
//         setDate(new Date(eventDates[0]));
//       } else {
//         setSelectedEvent("");
//         setDate(null);
//       }
//       setEventsLoading(false);
//     });
//   }, [selectedCampaign]);

//   const handlerChangeCampaign = (value: string) => {
//     const campaign = campaigns.find((c) => c.id === value);
//     setSelectedCampaign(campaign || {} as Campaign);
//   };

//   const handlerChangeEvent = (value: string) => {
//     const event = events.find(e => e.id === value);
//     if (event) {
//       setSelectedEvent(event);
//       setDate(new Date(event.start));
//     }
//   };

//   if (loading) return <SpinnerStrip show={true} size="medium" text="Loading campaigns..." />;

//   if (showEditor) {
//     return <CampaignEditor
//       eventId={editorCampaignId}
//       onSaved={handleCampaignSaved}
//       onCancelled={resetEditor} />
//   }

//   return (
//     <div className="space-y-4 max-w-xl mx-auto mt-8">
//       <Toolbar actions={actions} />
//       <div className="flex gap-4 items-center">
//         <Select
//           value={selectedCampaign.id}
//           onValueChange={handlerChangeCampaign}
//         >
//           <SelectTrigger className="w-48">
//             <SelectValue placeholder="Select campaign" />
//           </SelectTrigger>
//           <SelectContent>
//             {campaigns.map((c) => (
//               <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select
//           value={selectedEvent?.id}
//           onValueChange={handlerChangeEvent}
//           disabled={eventsLoading || events.length === 0}
//         >
//           <SelectTrigger className="w-48">
//             <SelectValue placeholder={eventsLoading ? "Loading events..." : "Select event date"} />
//           </SelectTrigger>
//           <SelectContent>
//             {events.map((event) => (
//               <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       {date && <Posts campaign={selectedCampaign} date={date} />}
//     </div>
//   );
// }

"use client"

import { useEffect, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Posts } from "@/components/posts/posts";
import { SpinnerStrip } from "@/components/wingui/spinner-strip/spinner-strip";
import { DashboardService } from "@/sdk/services/dashboard-service";
import { Campaign } from "@/sdk/contracts";
import { Pair } from "@/sdk/model/pair";

export default function PostsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>({} as Campaign);
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Pair>({} as Pair);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [events, setEvents] = useState<Pair[]>([]);

  useEffect(() => {
    setLoading(true);
    DashboardService.getCampaigns().then((data) => {
      setCampaigns(data);
      if (data[0]) {
        setSelectedCampaign(data[0]);
      }
      setLoading(false);
    });
  }, []);

  
  useEffect(() => {
    if (!selectedCampaign.id) return;
    setEventsLoading(true);
    DashboardService.getCampaignEvents(selectedCampaign.id).then((events) => {
      setEvents(events);
      if (events && events.length > 0) {
        setSelectedEvent(events[0]);
        setDate(new Date(events[0].id));
      } else {
        setSelectedEvent({} as Pair);
        setDate(new Date());
      }
      setEventsLoading(false);
    });
  }, [selectedCampaign]);

  const handlerChangeCampaign = (value: string) => {
    const campaign = campaigns.find((c) => c.id === value);
    setSelectedCampaign(campaign || {} as Campaign);
  };

  const handlerChangeEvent = (value: string) => {
    const event = events.find(e => e.id === value);
    if (event) {
      setSelectedEvent(event);
      setDate(new Date(event.id));
    }
  };

  if (loading) return <SpinnerStrip show={true} size="medium" text="Loading campaigns..." />;

  return (
    <div className="space-y-4 max-w-xl mx-auto mt-8">
      <div className="flex gap-4 items-center">
        <Select
          value={selectedCampaign.id}
          onValueChange={handlerChangeCampaign}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={selectedEvent?.id}
          onValueChange={handlerChangeEvent}
          disabled={eventsLoading || !events || events.length === 0}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={eventsLoading ? "Loading events..." : "Select event date"} />
          </SelectTrigger>
          <SelectContent>
            {events && events.map((event) => (
              <SelectItem key={event.id} value={event.id}>{event.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Posts campaign={selectedCampaign} date={date} />
    </div>
  );
}
