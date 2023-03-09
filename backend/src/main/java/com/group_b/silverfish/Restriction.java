package com.group_b.silverfish;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Restriction {
    int RestrictionID;
    int MaxLoanDays;
    int MinAge;
    long AvailabilityEndDate;

    public int getRestrictionID() {
        return RestrictionID;
    }
    public int getMaxLoanDays() {
        return MaxLoanDays;
    }
    public int getMinAge() {
        return MinAge;
    }
    public long getAvailabilityEndDate() {
        return AvailabilityEndDate;
    }
    
    Restriction(@JsonProperty("RestrictionID") int restrictionID,
                @JsonProperty("MaxLoanDays") int maxLoanDays,
                @JsonProperty("MinAge") int minAge,
                @JsonProperty("AvailabilityEndDate") long availabilityEndDate){
        RestrictionID = restrictionID;
        MaxLoanDays = maxLoanDays;
        MinAge = minAge;
        AvailabilityEndDate = availabilityEndDate;
    }

    Restriction(int maxLoanDays, int minAge, long availabilityEndDate){
        this(-1, maxLoanDays, minAge, availabilityEndDate);
    }
}
