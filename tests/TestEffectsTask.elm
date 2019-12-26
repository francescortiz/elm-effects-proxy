module TestEffectsTask exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Test exposing (..)


suite : Test
suite =
    describe "Works as regular HTTP calls."
        [ test "How to test side effects?"
            (\_ ->
                Expect.equal 1 1
            )
        ]
