DECLARE @date DATETIME

SELECT @date = '10/31/09'

SELECT
    e.EmpId,
    e.EmpName,
    et.Region,
    FOrdDate = MIN(o.OrderDate),
    LOrdDate = MAX(o.OrderDate)
    FROM #Employees e INNER JOIN #EmpTours et
        ON e.EmpId = et.EmpId INNER JOIN #Orders o
        ON e.EmpId = o.EmpId
    WHERE et.TourStartDate <= @date
        AND (et.TourEndDate > = @date OR et.TourEndDate IS NULL)
        AND o.OrderDate BETWEEN et.TourStartDate AND @date
    GROUP BY e.EmpId,e.EmpName,et.Region,et.TourStartDate,et.TourEndDate