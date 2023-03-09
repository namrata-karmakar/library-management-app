package com.group_b.silverfish;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(maxAge = 3600) // add [origins = "http://domain.com"] once we have client infrastructure in
                            // place
@RestController
public class ReportsController {
    Database db = new Database();

    // list all reports
    @GetMapping(path = "/reports",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> viewAllReports() {
        String resp = db.viewAllReports();
        if (resp != null)
            return ResponseEntity.ok(resp);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not get reports list");
    }

    // view report params
    @GetMapping(path = "/reportParams",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getReportParams(@RequestParam(value = "id") int ReportID) {
        String resp = db.getReportParams(ReportID);
        if (resp != null)
            return ResponseEntity.ok(resp);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not get params for report");
    }

    // generate a report
    @GetMapping(path = "/generateReport",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> generateReport(@RequestParam(value = "id") int reportID, @RequestParam(value = "xml") String paramXML ) {
        String resp = db.generateReport(reportID, paramXML);
        if (resp != null)
            return ResponseEntity.ok(resp);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Could not generate report");
    }
}
