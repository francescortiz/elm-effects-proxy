module EffectsProxyDemo exposing (..)

import Browser exposing (Document)
import EffectsProxy
import Html exposing (Html, text)
import Http exposing (Error(..), Response(..))
import Json.Encode as E
import Task


type Msg
    = GotEffectResponse (Result Http.Error String)


type alias Flags =
    ()


type alias Model =
    {}


main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( {}
    , Cmd.batch
        [ EffectsProxy.cmd
            (Http.expectString GotEffectResponse)
            "keepFeeding"
            [ E.int 10 ]
        , EffectsProxy.cmd
            (Http.expectString GotEffectResponse)
            "patch"
            []
        , EffectsProxy.cmd
            (Http.expectString GotEffectResponse)
            "console.log"
            [ E.string "Pep", E.int 3 ]
        , EffectsProxy.cmd
            (Http.expectString GotEffectResponse)
            "document"
            [ E.string "Pep", E.int 3 ]
        , EffectsProxy.cmd
            (Http.expectString GotEffectResponse)
            "nothing.nothing"
            [ E.string "Pep", E.int 3 ]
        , EffectsProxy.cmd
            (Http.expectString GotEffectResponse)
            "asyncEcho"
            [ E.string "Happy" ]
        , EffectsProxy.cmd
            (Http.expectString GotEffectResponse)
            "crash"
            []
        , Task.attempt GotEffectResponse <|
            (EffectsProxy.task
                { resolver = EffectsProxy.simpleStringResolver
                , functionName = "asyncEcho"
                , arguments = [ E.int 4 ]
                , timeout = Nothing
                }
                |> Task.andThen
                    (\previousValue ->
                        if previousValue == "4" then
                            EffectsProxy.task
                                { resolver = EffectsProxy.simpleStringResolver
                                , functionName = "echo"
                                , arguments = [ E.string "Nice! We received the 4!" ]
                                , timeout = Nothing
                                }

                        else
                            EffectsProxy.task
                                { resolver = EffectsProxy.simpleStringResolver
                                , functionName = "echo"
                                , arguments = [ E.string "Shit! We didn't receive the 4!" ]
                                , timeout = Nothing
                                }
                    )
            )
        ]
    )


view : Model -> Document Msg
view model =
    { title = "Elm Effects Proxy Demo"
    , body = [ text "Effects proxy demo" ]
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        _ =
            Debug.log "msg" msg
    in
    ( model, Cmd.none )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none
