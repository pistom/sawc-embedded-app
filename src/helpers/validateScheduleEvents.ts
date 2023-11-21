export const validateScheduleEvent = (event: ScheduleEvent): string[] => {
    const errors = [] as string[];
    if (!event.device) errors.push('Device is required');
    if (!event.output) errors.push('Output is required');
    if (!event.type) errors.push('Type is required');
    if (event.watering.length === 0) errors.push('You must add at least one watering');
    if (event.watering.some((watering: Watering) => Number(watering.volume) <= 0)) errors.push('Watering volume must be greater than 0');
    if (event.watering.some((watering: Watering) => watering.time.getHours() === 0 && watering.time.getMinutes() === 0)) errors.push('Watering time is required');
    if ((event.type === 'period' || event.type === 'always') && event.repeatEvery && event.repeatEvery < 1) errors.push('Repeat every must be greater than 0');
    if ((event.type === 'period' || event.type === 'always') && event.repeatEvery && event.repeatEvery > 365) errors.push('Repeat every must be less than 365');
    if ((event.type === 'period' || event.type === 'always') && !event.days && !event.repeatEvery) errors.push('Days or repeat every is required');
    if ((event.type === 'period' || event.type === 'always') && event.days && event.days.length === 0) errors.push('You must select at least one day');
    if ((event.type === 'period' || event.type === 'once') && !event.startDate) errors.push('Start date is required');
    if (event.type === 'period' && !event.endDate) errors.push('End date is required');
    if (event.type === 'period' && event.startDate && event.endDate && event.startDate > event.endDate) errors.push('Start date must be before end date');
    if (event.type === 'period' && event.startDate && event.endDate && event.startDate.toLocaleDateString() === event.endDate.toLocaleDateString()) errors.push('Start date and end date must be different');
    if (event.repeatEvery && event.repeatEvery > 365) errors.push('Repeat every must be less than 365');
    return errors;
}
