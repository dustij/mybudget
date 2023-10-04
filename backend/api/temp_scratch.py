from dateutil.rrule import rrule, WEEKLY, DAILY, MONTHLY, YEARLY, SU, MO, TU, WE, TH, FR, SA
import datetime


class Rule:
    FREQUENCY_CHOICES = {
        "Yearly": YEARLY,
        "Monthly": MONTHLY,
        "Biweekly": WEEKLY,
        "Weekly": WEEKLY,
        "Daily": DAILY,
    }

    WEEKDAY_CHOICES = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6,
    }

    def __init__(
        self,
        freq, 
        dtstart=None, 
        interval=1, 
        wkst=None, 
        count=None, 
        until=None, 
        bysetpos=None, 
        bymonth=None, 
        bymonthday=None, 
        byyearday=None, 
        byeaster=None, 
        byweekno=None, 
        byweekday=None, 
        byhour=None, 
        byminute=None, 
        bysecond=None, 
        cache=False):
        self.freq = Rule.FREQUENCY_CHOICES.get(freq)
        self.dtstart = dtstart
        self.interval = interval
        self.wkst = wkst
        self.count = count
        self.until = until
        self.bysetpos = bysetpos
        self.bymonth = bymonth
        self.bymonthday = bymonthday
        self.byyearday = byyearday
        self.byeaster = byeaster
        self.byweekno = byweekno
        self.byweekday = Rule.WEEKDAY_CHOICES.get(byweekday)
        self.byhour = byhour
        self.byminute = byminute
        self.bysecond = bysecond
        self.cach = cache

    def __str__(self):
        return str(self.freq) + " " + str(self.byweekday)

    def get_rrule(self):
        """
        Generates and returns an rrule based on the rule's settings.
        """
        params = {
            "interval": self.interval,
            "dtstart": self.dtstart,
            "until": self.until,
        }

        print(params)

        if self.freq == DAILY:
            return rrule(DAILY, **params)

        if self.freq == WEEKLY:
            params["byweekday"] = self.byweekday
            return rrule(WEEKLY, **params)

        if self.freq == MONTHLY:
            params["bymonthday"] = self.bymonthday
            return rrule(MONTHLY, **params)

        if self.freq == YEARLY:
            params["bymonth"] = self.bymonth
            return rrule(YEARLY, **params)

        if self.freq == "Biweekly":
            params["byweekday"] = self.byweekday
            return rrule(WEEKLY, **params)

    def get_occurrences(self, start, end):
        """
        Returns a list of occurrences between start and end.
        """
        return self.get_rrule().between(start, end, inc=True)

    

# Rule for weekly mock JSON
weekly_JSON = {
    "freq": "Weekly",
    "byweekday": "Friday",
    "interval": 2,
    "dtstart": datetime.datetime(2023, 10, 13),
}

rule = Rule(**weekly_JSON)
for occurrence in rule.get_occurrences(weekly_JSON["dtstart"], datetime.datetime(2023, 12, 1)):
    print(occurrence)

# Rule for biweekly mock JSON
# Rule for monthly mock JSON
# Rule for yearly mock JSON