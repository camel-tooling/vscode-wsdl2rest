# Next steps for your wsdl2rest artifacts

Now that you've generated your Camel Rest DSL configuration and all the CXF classes
to wrap your SOAP-based service to make it accessible in a RESTful way, you may have
some additional steps before you can make it run.

If you generated artifacts in a Maven-based Camel or Fuse project, you may have to update 
the pom file with a few additional dependencies as follows.

## Spring- and Spring Boot-based projects

```xml
    <!-- wsdl2rest dependencies -->
    <dependency>
        <groupId>org.jboss.spec.javax.ws.rs</groupId>
        <artifactId>jboss-jaxrs-api_2.0_spec</artifactId>
        <version>1.0.0.Final-redhat-1</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-jackson</artifactId>
        <version>${camel.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-cxf</artifactId>
        <version>${camel.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-jetty</artifactId>
        <version>${camel.version}</version>
    </dependency>
```

## Blueprint-based projects

```xml
    <!-- wsdl2rest dependencies -->
    <dependency>
        <groupId>org.jboss.spec.javax.ws.rs</groupId>
        <artifactId>jboss-jaxrs-api_2.0_spec</artifactId>
        <version>1.0.0.Final-redhat-1</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-jackson</artifactId>
        <version>${camel.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-cxf</artifactId>
        <version>${camel.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-servlet</artifactId>
        <version>${camel.version}</version>
    </dependency>
```
