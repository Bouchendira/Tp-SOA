package com.example.demo;



import org.exemple.student.StudentDetailsRequest;
import org.exemple.student.Student;
import org.exemple.student.StudentDetailsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

@Endpoint
public class StudentEndpoint {

    private static final String NAMESPACE_URI =
            "http://www.exemple.org/student";

    private final StudentRepository studentRepository;

    @Autowired
    public StudentEndpoint(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PayloadRoot(
            namespace = NAMESPACE_URI,
            localPart = "StudentDetailsRequest"
    )
    @ResponsePayload
    public StudentDetailsResponse getStudent(
            @RequestPayload StudentDetailsRequest request) {

        Student student =
                studentRepository.findStudent(request.getName());

        StudentDetailsResponse response =
                new StudentDetailsResponse();

        if (student != null) {
            response.setStudent(student);
        }

        return response;
    }
}