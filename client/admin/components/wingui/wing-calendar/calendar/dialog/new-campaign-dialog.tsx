import { useCalendarContext } from '../calendar-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/wingui/wing-calendar/ui/dialog';
import { CampaignEditor } from '@/components/campaign/campaign-editor';
import { Campaign as CampaignModel } from '@/sdk/model/campaign';
import { Campaign } from '@/sdk/contracts/campaign';

export default function NewCampaignDialog() {
  const { newEventDialogOpen, setNewEventDialogOpen, setEvents, events } = useCalendarContext();

  async function handleSaved(campaign: Campaign) {
    const campaignModel = new CampaignModel(campaign);
    const updatedEvents = await campaignModel.refreshEvents(events);
    setEvents(updatedEvents);
    setNewEventDialogOpen(false);
  }

  return (
    <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
        </DialogHeader>
        <CampaignEditor
          dialog={false}
          onSaved={handleSaved}
          onCancelled={() => setNewEventDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 