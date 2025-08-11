import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../sdk/services/dashboard-service';
import { Campaign } from '../../sdk/contracts/campaign';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '../ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { MarketingService } from '@/sdk/services/marketing-service';
import { ColorPicker } from '@/components/wingui/wing-calendar/form/color-picker'
import { CampaignMediaManager } from './campaign-media-manager';
import { Media } from '@/components/wingui/media-gallery/types/media';
import { dummyRestaurantMedia } from '@/components/wingui/media-gallery/demo/data';
import { AlertStrip } from '@/components/wingui/alert-strip/alert-strip';
import { Campaign as CampaignModel } from '@/sdk/model/campaign';

interface CampaignEditorProps {
  eventId?: string;
  onSaved?: (campaign: Campaign) => void;
  onCancelled?: () => void;
  dialog?: boolean;
}

export const CampaignEditor: React.FC<CampaignEditorProps> = ({ eventId, onSaved, onCancelled, dialog }) => {
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<Campaign>(() => new Campaign());
  const [recurring, setRecurring] = useState(false);
  const [recEnds, setRecEnds] = useState<'never' | 'on' | 'after'>('never');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isNew, setIsNew] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [campaignId, setCampaignId] = useState<string>('');
  const [mediaItems, setMediaItems] = useState<Media[]>(dummyRestaurantMedia);
  const [alertError, setAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Load campaign if editing
  useEffect(() => {
    if (eventId) {
      const id = CampaignModel.getCampaignId(eventId);
      setCampaignId(id);

      if (!campaignId) {
        console.log('campaignId is undefined');
      }
    
      setLoading(true);
      DashboardService.loadCampaign(id).then(c => {
        if (c) {
          setCampaign({ ...c });
          setRecurring(!!c.recurrence);
          setIsNew(false);
          if (c.recurrence) {
            if (c.recurrence.until) setRecEnds('on');
            else if (c.recurrence.count) setRecEnds('after');
            else setRecEnds('never');
          }
        }
        setLoading(false);
      });
    } else {
      setIsNew(true);
      // Set start to now and end to start + 24 hours
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const yyyy = now.getFullYear();
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = pad(now.getHours());
      const min = pad(now.getMinutes());
      const start = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const endY = endDate.getFullYear();
      const endM = pad(endDate.getMonth() + 1);
      const endD = pad(endDate.getDate());
      const endH = pad(endDate.getHours());
      const endMin = pad(endDate.getMinutes());
      const end = `${endY}-${endM}-${endD}T${endH}:${endMin}`;
      // Get today's day code for byDay
      const dayIdx = now.getDay(); // 0=Sunday
      const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const todayCode = dayCodes[dayIdx];
      setRecEnds('never');

      setCampaign(prev => ({
        ...prev,
        channels: prev.channels && prev.channels.length > 0 ? prev.channels : ['Facebook', 'Instagram'],
        start: prev.start || start,
        end: prev.end || end,
        lead: 1,
        recurrence: prev.recurrence || {
          frequency: 'daily',
          interval: 1,
          byDay: [todayCode],
          count: undefined,
          until: undefined,
        },
      }));
    }
  }, [eventId]);

  // Only set id from event if new
  useEffect(() => {
    if (isNew) {
      setCampaign(prev => ({ ...prev, id: CampaignModel.toKebabCase(prev.name) }));
    }
  }, [campaign.name, isNew]);

  // Recurrence state sync
  useEffect(() => {
    if (!recurring) {
      setCampaign(prev => ({ ...prev, recurrence: undefined }));
    } else {
      setCampaign(prev => ({
        ...prev,
        recurrence: prev.recurrence && prev.recurrence.frequency
          ? { ...prev.recurrence }
          : {
            frequency: 'daily',
            interval: 1,
            byDay: [],
          },
      }));
    }
  }, [recurring]);

  // Recurrence ends radio sync
  useEffect(() => {
    if (!campaign.recurrence) return;
    if (recEnds === 'never') {
      setCampaign(prev => ({
        ...prev,
        recurrence: prev.recurrence ? { ...prev.recurrence, count: undefined, until: undefined, frequency: prev.recurrence.frequency || 'daily' } : undefined,
      }));
    } else if (recEnds === 'on') {
      setCampaign(prev => ({
        ...prev,
        recurrence: prev.recurrence ? { ...prev.recurrence, count: undefined, frequency: prev.recurrence.frequency || 'daily' } : undefined,
      }));
    } else if (recEnds === 'after') {
      setCampaign(prev => ({
        ...prev,
        recurrence: prev.recurrence ? { ...prev.recurrence, until: undefined, frequency: prev.recurrence.frequency || 'daily' } : undefined,
      }));
    }
  }, [recEnds, campaign.recurrence]);

  // Validation
  useEffect(() => {
    const errs: { [k: string]: string } = {};
    if (!campaign.id) errs.id = 'ID is required.';
    if (!campaign.name) errs.event = 'Event is required.';
    if (!campaign.theme) errs.theme = 'Theme is required.';
    if (!campaign.start) errs.start = 'Start date is required.';
    if (CampaignModel.isEndBeforeStart(campaign.start, campaign.end)) errs.end = 'End date cannot be before start date.';
    if (!campaign.channels || campaign.channels.length === 0) errs.channels = 'Select at least one channel.';
    setErrors(errs);
  }, [campaign]);

  const handleChange = (field: keyof Campaign, value: any) => {
    setCampaign(prev => ({ ...prev, [field]: value }));
  };

  const handleRecurrenceChange = (field: keyof NonNullable<Campaign['recurrence']>, value: any) => {
    setCampaign(prev => ({
      ...prev,
      recurrence: prev.recurrence
        ? {
          ...prev.recurrence,
          frequency: prev.recurrence.frequency || 'daily',
          [field]: value,
        }
        : {
          frequency: 'daily',
          interval: 1,
          byDay: [],
          [field]: value,
        },
    }));
  };

  const handleByDayToggle = (code: string) => {
    if (!campaign.recurrence) return;
    const byDay = campaign.recurrence.byDay || [];
    if (byDay.includes(code)) {
      handleRecurrenceChange('byDay', byDay.filter(d => d !== code));
    } else {
      handleRecurrenceChange('byDay', [...byDay, code]);
    }
  };

  const handleChannelToggle = (channel: string) => {
    const channels = campaign.channels || [];
    if (channels.includes(channel)) {
      handleChange('channels', channels.filter(c => c !== channel));
    } else {
      handleChange('channels', [...channels, channel]);
    }
  };

  const handleSave = async () => {
    setShowErrors(true);
    // Validate before save
    const errs: { [k: string]: string } = {};
    if (!campaign.id) errs.id = 'ID is required.';
    if (!campaign.name) errs.event = 'Event is required.';
    if (!campaign.theme) errs.theme = 'Theme is required.';
    if (!campaign.start) errs.start = 'Start date is required.';
    if (CampaignModel.isEndBeforeStart(campaign.start, campaign.end)) errs.end = 'End date cannot be before start date.';
    if (!campaign.channels || campaign.channels.length === 0) errs.channels = 'Select at least one channel.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    if (isNew) {
      const response = await MarketingService.createCampaign(campaign);
      if (response.success) {
        setCampaignId(response.data.id);
        setAlertError(false);
        setAlertMessage('Campaign created successfully!');
      } else {
        setAlertError(true);
        setAlertMessage(response.error?.message || 'Failed to create campaign');
      }
    } else {
      const response = await MarketingService.updateCampaign(campaign);
      if (response.success) {
        setCampaignId(response.data.id);
        setAlertError(false);
        setAlertMessage('Campaign updated successfully!');
      } else {
        setAlertError(true);
        setAlertMessage(response.error?.message || 'Failed to update campaign');
      }
    }

    setLoading(false);
    if (onSaved) onSaved(campaign);
  };

  // Remove isDialog conditionals for layout, always use compact UI
  const rowClass = "flex items-center gap-1";
  const labelClass = "w-20 shrink-0";
  const controlClass = "flex-1 min-w-0";
  const inputClass = "w-54";
  const inputNumberClass = "w-20";
  const formClass = "space-y-2 w-full mx-auto p-2 bg-white rounded";
  const dialogContentClass = "sm:max-w-3xl";
  const tabsContentClass = "min-h-[320px]";

  const formContent = (
    <>
      {alertError && <AlertStrip type="error" title="Error" message={alertMessage} />}
      {!alertError && alertMessage && <AlertStrip type="success" title="Success" message={alertMessage} />}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
      <TabsContent value="general" className={tabsContentClass}>
        <form className={formClass} onSubmit={e => e.preventDefault()}>
          <div className={rowClass}>
            <Label htmlFor="id" className={labelClass}>ID</Label>
            <Input id="id" value={campaign.id} readOnly className={`bg-gray-100 text-gray-500 ${controlClass}`} />
            <span className={`text-red-600 text-sm min-h-[20px] ${showErrors && errors.id ? '' : 'invisible'}`}>{showErrors && errors.id ? errors.id : ' '}</span>
          </div>
          <div className={rowClass}>
            <Label htmlFor="event" className={labelClass}>Event</Label>
            <Input
              id="event"
              value={campaign.name}
              onChange={e => handleChange('name', e.target.value)}
              required
              className="w-full"
            />
            <span className={`text-red-600 text-sm min-h-[20px] ${showErrors && errors.event ? '' : 'invisible'}`}>{showErrors && errors.event || ' '}</span>
          </div>
          <div className={rowClass}>
            <Label htmlFor="theme" className={labelClass}>Theme</Label>
            <Textarea
              id="theme"
              value={campaign.theme}
              onChange={e => handleChange('theme', e.target.value)}
              required
              className={controlClass + (dialog ? " min-h-[32px] max-h-[48px]" : "")}
              rows={dialog ? 2 : 3}
            />
            <span className={`text-red-600 text-sm min-h-[20px] ${showErrors && errors.theme ? '' : 'invisible'}`}>{showErrors && errors.theme || ' '}</span>
          </div>
          <div className={rowClass}>
            <Label htmlFor="dates" className={labelClass}>Dates</Label>
            <div className="flex gap-2 flex-1">
              <Input
                id="start"
                type="datetime-local"
                value={campaign.start || ''}
                onChange={e => handleChange('start', e.target.value)}
                className={inputClass}
              />
              <span className={`text-red-600 text-sm min-h-[20px] ${showErrors && errors.start ? '' : 'invisible'}`}>{showErrors && errors.start || ' '}</span>
              <Input
                id="end"
                type="datetime-local"
                value={campaign.end || ''}
                onChange={e => handleChange('end', e.target.value)}
                className={inputClass}
              />
              <span className={`text-red-600 text-sm min-h-[20px] ${showErrors && errors.end ? '' : 'invisible'}`}>{showErrors && errors.end || ' '}</span>
            </div>
          </div>
          <div className={rowClass}>
            <Label htmlFor="channels" className={labelClass}>Channels</Label>
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" type="button" className="h-10 w-full text-left">
                    {campaign.channels && campaign.channels.length > 0
                      ? campaign.channels.join(', ')
                      : 'Select Channels'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {CampaignModel.SOCIAL_CHANNELS.map(channel => (
                    <DropdownMenuCheckboxItem
                      key={channel}
                      checked={campaign.channels?.includes(channel) || false}
                      onCheckedChange={() => handleChannelToggle(channel)}
                    >
                      {channel}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className={`text-red-600 text-sm min-h-[20px] ${showErrors && errors.channels ? '' : 'invisible'}`}>{showErrors && errors.channels || ' '}</span>
            </div>
          </div>
          <div className={rowClass}>
            <Label htmlFor="lead" className={labelClass}>Lead</Label>
            <Input
              id="lead"
              type="number"
              min={0}
              value={campaign.lead ?? 0}
              onChange={e => handleChange('lead', Math.max(0, parseInt(e.target.value) || 0))}
              className={inputNumberClass}
            />
          </div>
          {/* Color Picker Row */}
          <div className={rowClass}>
            <Label htmlFor="color" className={labelClass}>Color</Label>
            <div className={controlClass}>
              <ColorPicker
                field={{
                  value: campaign.color || 'blue',
                  onChange: (value: string) => handleChange('color', value),
                }}
              />
            </div>
          </div>
        </form>
      </TabsContent>
      <TabsContent value="recurrence" className={tabsContentClass}>
        <form className={formClass} onSubmit={e => e.preventDefault()}>
          <div className={rowClass}>
            <Switch
              id="recurring"
              checked={recurring}
              onCheckedChange={checked => setRecurring(!!checked)}
            />
            <Label htmlFor="recurring" className={labelClass}>Recurrence</Label>
          </div>
           <div className="space-y-2 border rounded p-2">
             <div className={rowClass}>
               <Label className="w-25">Repeat every</Label>
               <Input
                 type="number"
                 min={1}
                 value={campaign.recurrence?.interval ?? 1}
                 onChange={e => handleRecurrenceChange('interval', Math.max(1, parseInt(e.target.value) || 1))}
                 className={inputNumberClass}
                 disabled={!recurring}
               />
               <select
                 value={campaign.recurrence?.frequency}
                 onChange={e => handleRecurrenceChange('frequency', e.target.value)}
                 className="border rounded px-2 py-1 h-10"
                 disabled={!recurring}
               >
                 <option value="daily">Day</option>
                 <option value="weekly">Weekly</option>
                 <option value="monthly">Monthly</option>
                 <option value="yearly">Yearly</option>
               </select>
             </div>
             <div className={rowClass}>
               <Label className={labelClass}>Repeat on</Label>
             </div>
             <div className="flex gap-1 justify-start ml-20">
               {CampaignModel.DAYS_OF_WEEK.map(day => (
                 <button
                   key={day.code}
                   type="button"
                   title={day.tooltip}
                   className={`rounded-full w-8 h-8 flex items-center justify-center border ${campaign.recurrence && campaign.recurrence.byDay && campaign.recurrence.byDay.includes(day.code) ? 'bg-black text-white' : 'bg-white'} ${!recurring ? 'opacity-50 cursor-not-allowed' : ''}`}
                   onClick={() => recurring && handleByDayToggle(day.code)}
                   disabled={!recurring}
                 >
                   {day.label}
                 </button>
               ))}
             </div>
             <div className={rowClass}>
               <Label className={labelClass}>Ends</Label>
             </div>
             <RadioGroup className="pt-5" value={recEnds} onValueChange={v => setRecEnds(v as 'never' | 'on' | 'after')}>
               <div className={rowClass + " mb-2"}>
                 <RadioGroupItem value="never" id="ends-never" disabled={!recurring} />
                 <Label htmlFor="ends-never" className={labelClass}>Never</Label>
               </div>
               <div className={rowClass + " mb-2"}>
                 <RadioGroupItem value="on" id="ends-on" disabled={!recurring} />
                 <Label htmlFor="ends-on" className={labelClass}>On</Label>
                 <Input
                   type="date"
                   value={campaign.recurrence?.until || ''}
                   onChange={e => handleRecurrenceChange('until', e.target.value)}
                   disabled={recEnds !== 'on' || !recurring}
                   className={inputClass}
                 />
               </div>
               <div className={rowClass}>
                 <RadioGroupItem value="after" id="ends-after" disabled={!recurring} />
                 <Label htmlFor="ends-after" className={labelClass}>After</Label>
                 <Input
                   type="number"
                   min={1}
                   value={campaign.recurrence?.count ?? 1}
                   onChange={e => handleRecurrenceChange('count', Math.max(1, parseInt(e.target.value) || 1))}
                   className={inputNumberClass}
                   disabled={recEnds !== 'after' || !recurring}
                 /> occurrences
               </div>
             </RadioGroup>
           </div>
        </form>
      </TabsContent>
      <TabsContent value="media" className={tabsContentClass}>
        <div className="w-full max-h-[400px] overflow-hidden">
          <CampaignMediaManager
            selectedMediaIds={campaign.medias || []}
            onMediaChange={(mediaIds) => handleChange('medias', mediaIds)}
            allMedia={mediaItems}
            onMediaUpload={(newMedia) => {
              setMediaItems(prev => [...prev, ...newMedia])
            }}
            showFilters={false}
          />
        </div>
      </TabsContent>
      <div className="pt-2 flex gap-2 justify-end">
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancelled}>
          Cancel
        </Button>
      </div>
    </Tabs>
    </>
  );

  if (dialog) {
    return (
      <Dialog open onOpenChange={onCancelled}>
        <DialogContent showCloseButton className={dialogContentClass}>
          <DialogHeader>
            <DialogTitle>{isNew ? 'Create Campaign' : 'Edit Campaign'}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }
  return formContent;
};
