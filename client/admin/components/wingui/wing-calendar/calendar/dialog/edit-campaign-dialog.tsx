import { useCalendarContext } from '../calendar-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/wingui/wing-calendar/ui/dialog';
import { CampaignEditor } from '@/components/campaign/campaign-editor';
import { Campaign } from '@/sdk/contracts/campaign';
import { Campaign as CampaignModel } from '@/sdk/model/campaign';

export default function EditCampaignDialog() {
  const { manageEventDialogOpen, setManageEventDialogOpen, selectedEvent, setEvents, events } = useCalendarContext();

  async function handleSaved(campaign: Campaign) {
    const campaignModel = new CampaignModel(campaign);
    const updatedEvents = await campaignModel.refreshEvents(events);
    setEvents(updatedEvents);
    setManageEventDialogOpen(false);
  }

  return (
    <Dialog open={manageEventDialogOpen} onOpenChange={setManageEventDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>
        {selectedEvent && (
          <CampaignEditor
            eventId={selectedEvent.id}
            dialog={false}
            onSaved={handleSaved}
            onCancelled={() => setManageEventDialogOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 