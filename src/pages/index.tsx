import { Flex, Text, Box, Button, Stack, Textarea, SimpleGrid } from '@chakra-ui/react'
import { useState } from 'react';
import { Input } from '../components/Form/Input'


type SessionDataEntry =
  | {
    kind: "char";
    name: string;
  }
  | {
    kind: "data";
    name: string;
    value: string;
  };


export default function WasteLog() {
  const [sessionData1, setSessionData1] = useState("");
  const [preyCard, setPreyCard] = useState("0");
  const [priceTc, setPriceTc] = useState("0");


  function handleSessionData(value) {
    setSessionData1(value);
    console.log(sessionData1)
  }

  function handlePreyCard(value) {
    setPreyCard(value);
  }

  function handlePriceTc(value) {
    setPriceTc(value);
  }



  function parseSessionData(s: string): SessionDataEntry[] {
    return s
      .trim()
      .split("\n")
      .map((line) => {
        const infoMatch = line.trim().match(/([^:]+):\s*(.*)/);

        if (infoMatch === null) {
          return { kind: "char", name: line.trim() };
        } else {
          return {
            kind: "data",
            name: infoMatch[1],
            value: infoMatch[2],
          };
        }
      });
  }

  const sessionData = sessionData1;

  const entries = parseSessionData(sessionData);



  let currentChar: string | null = null;
  let charCount = 0;
  let total = 0;
  const balances: { [key: string]: number } = {};

  entries.forEach((entry) => {
    if (entry.kind === "char") {
      currentChar = entry.name;
      charCount++;
    } else if (entry.kind === "data") {
      if (entry.name === "Balance") {
        let balance = parseFloat(entry.value.replace(/,/g, ""));

        if (currentChar === null) {
          total = balance;
        } else {
          balances[currentChar] = balance;
        }
      }
    }
  });





  const preyCardCount = parseFloat(preyCard);
  const tcPrice = parseFloat(priceTc);


  // discount prey card costs
  total -= preyCardCount * tcPrice * 10;

  const k = Math.floor(total / charCount);


  const toReceive: { name: string; value: number }[] = [];
  const toPay: { name: string; value: number }[] = [];
  Object.keys(balances).forEach((char) => {
    const n = k - balances[char];
    if (n > 0) {
      toReceive.push({ name: char, value: n });
    } else {
      toPay.push({ name: char, value: -n });
    }
    console.log(n)
  });


  toReceive.sort((a, b) => b.value - a.value);
  toPay.sort((a, b) => b.value - a.value);



  // const result: { payer: string; value: number; receiver: string }[] = [];
  // const result: { [payer: string]: number } = {};
  const result: { payer: string; value: number; receiver: string }[] = [];
  while (toReceive.length > 0 && toPay.length > 0) {
    const receiver = toReceive[0];
    const payer = toPay[0];

    const amount = Math.min(receiver.value, payer.value);
    console.log(`${payer.name} to pay ${amount} to ${receiver.name}`);
    result.push({ payer: payer.name, value: amount, receiver: receiver.name });


    toReceive[0].value -= amount;
    toPay[0].value -= amount;

    if (toPay[0].value === 0) {
      toPay.shift();
    }
    if (toReceive[0].value === 0) {
      toReceive.shift();
    }
  }

  console.log(result)


  return (
    <>
      <Flex w="100vw" h="100vh" align="center" justify="center" >

        <Flex width="100%" maxWidth={700} bg="gray.800" mx="auto" borderRadius={8}>

          <SimpleGrid py="5" px="5" gap="4" minChildWidth="320px" align="flex-start">
            <Box>
              <Text>Party Session</Text>
              <Textarea fontSize="sm" height="500" maxWidth={360} size="lg" type="text" name="data" label="Session data"
                onChange={(event) => {
                  handleSessionData(event.target.value);
                }} />
            </Box>
          </SimpleGrid >

          <SimpleGrid minChildWidth="320px" align="center" alignSelf="center" mx="auto">
            <Box>
              <Input mb="2" type="number" name="data" label="Prey Card" size="md"
                onChange={(event) => {
                  handlePreyCard(event.target.value);
                }} />

              <Input type="number" name="data" label="Tc price" size="md"
                onChange={(event) => {
                  handlePriceTc(event.target.value);
                }} />

              {/* <Button type="submit" mt="6" mb="8" colorScheme="purple" size="md" alignSelf="center">
                Calcular
              </Button> */}

              <Box>
                <Text mt="8">Result</Text>
                <Text>{result.map((x, y) =>

                  <span key={y}>{`${x.payer} to pay ${x.value} to ${x.receiver}`}<br/></span> )
                  
                }
                </Text>
              </Box>
            </Box>
          </SimpleGrid >
        </Flex>

      </Flex>
    </>
  )
}


