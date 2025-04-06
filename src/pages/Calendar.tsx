
import { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFoodItems, FoodItem } from '@/hooks/use-food-items';
import Layout from '@/components/Layout';
import FoodItemCard from '@/components/FoodItemCard';
import { Loader2 } from 'lucide-react';

const Calendar = () => {
  const { foodItems, loading, markAsConsumed, deleteFoodItem } = useFoodItems();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Generate a map of expiry dates to counts for the calendar
  const expiryDateMap = foodItems.reduce((acc, item) => {
    const date = format(parseISO(item.expiry_date), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get items for the selected date
  const selectedDateItems = selectedDate
    ? foodItems.filter(item => 
        isSameDay(parseISO(item.expiry_date), selectedDate)
      )
    : [];
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Expiry Calendar</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 lg:col-span-1">
            <CardContent className="pt-6">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border p-3 pointer-events-auto"
                modifiersStyles={{
                  selected: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'white'
                  }
                }}
                modifiers={{
                  expiryDay: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return !!expiryDateMap[dateStr];
                  }
                }}
                classNames={{
                  day_today: 'bg-accent-100 text-accent-foreground',
                  day_selected: 'bg-primary !text-primary-foreground',
                  day_outside: 'text-muted-foreground opacity-50',
                  day: 'h-10 w-10 font-normal aria-selected:opacity-100',
                }}
                components={{
                  DayContent: ({ date, activeModifiers }) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const count = expiryDateMap[dateStr];
                    
                    if (!count) {
                      return <span>{date.getDate()}</span>;
                    }
                    
                    return (
                      <div className="relative h-full w-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        <Badge 
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                          variant={activeModifiers.selected ? "outline" : "default"}
                        >
                          {count}
                        </Badge>
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedDate ? (
                  <>Items Expiring on {format(selectedDate, 'MMM d, yyyy')}</>
                ) : (
                  <>Select a Date</>
                )}
              </h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : selectedDateItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {selectedDateItems.map(item => (
                    <FoodItemCard 
                      key={item.id} 
                      item={item} 
                      onConsume={markAsConsumed} 
                      onDelete={deleteFoodItem} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {selectedDate ? (
                    <>No items expire on this date.</>
                  ) : (
                    <>Select a date to view expiring items.</>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
